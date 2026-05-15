import { authClient } from "./api";
import { User } from "../models/User";
import { StorageProvider } from "../storage/StorageProvider";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";

class SecurityService extends EventTarget {
    private readonly keyToken: string;
    private readonly userKey: string;
    private readonly API_URL: string;
    private user: User | null;
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        super();

        this.storage = storage;
        this.keyToken = "token";
        this.userKey = "user";
        this.API_URL = import.meta.env.VITE_API_URL_SECURITY || "http://localhost:5000/api/auth";
        this.user = this.loadStoredUser();
    }

    private loadStoredUser(): User | null {
        const storedUser = this.storage.getItem(this.userKey);

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error("Error parsing stored user:", error);
            this.storage.removeItem(this.userKey);
            return null;
        }
    }

    private normalizeEmail(user: User): User {
        return {
            ...user,
            email: user.email?.trim().toLowerCase() ?? user.email,
        };
    }

    async login(user: User) {
        const normalizedUser = this.normalizeEmail(user);
        const response = await authClient.post("/login", normalizedUser);
        if (response.status !== 200) {
            throw new Error(`Login failed with status ${response.status}`);
        }

        const payload = response.data?.data ?? response.data;
        const authUser = payload?.user ?? payload;
        const accessToken = payload?.access_token ?? payload?.token;

        if (!authUser || !accessToken) {
            throw new Error("Invalid authentication response");
        }

        this.user = authUser;
        this.storage.setItem(this.userKey, JSON.stringify(this.user));
        this.storage.setItem(this.keyToken, accessToken);

        store.dispatch(setUser(this.user));
        this.dispatchEvent(new CustomEvent("userChange", { detail: this.user }));

        return this.user;
    }

    getUser() {
        return this.user;
    }

    logout() {
        this.user = null;

        this.storage.removeItem(this.userKey);
        this.storage.removeItem(this.keyToken);

        this.dispatchEvent(new CustomEvent("userChange", { detail: null }));
        store.dispatch(setUser(null));
    }

    isAuthenticated() {
        return this.storage.getItem(this.keyToken) !== null;
    }

    getToken() {
        return this.storage.getItem(this.keyToken);
    }
}

export default new SecurityService();