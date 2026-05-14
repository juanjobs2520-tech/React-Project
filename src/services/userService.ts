import { apiClient } from "./api";
import { User } from "../models/User";

const API_URL = "/users";

class UserService {
    async getUsers(): Promise<User[]> {
        try {
            const response = await apiClient.get<{ data?: User[] }>(`${API_URL}/`);
            return response.data.data ?? (response.data as unknown as User[]);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            return [];
        }
    }

    async getUserById(id: string | number): Promise<User | null> {
        try {
            const response = await apiClient.get<{ data?: User }>(`${API_URL}/${id}`);
            return response.data.data ?? (response.data as unknown as User);
        } catch (error) {
            console.error("Usuario no encontrado:", error);
            return null;
        }
    }

    async createUser(user: Partial<User>): Promise<User | null> {
        const response = await apiClient.post<{ data?: User }>(`${API_URL}/`, user);
        return response.data.data ?? (response.data as unknown as User);
    }

    async updateUser(id: number, user: Partial<User>): Promise<User | null> {
        const response = await apiClient.put<{ data?: User }>(`${API_URL}/${id}`, user);
        return response.data.data ?? (response.data as unknown as User);
    }

    async deleteUser(id: number): Promise<boolean> {
        try {
            await apiClient.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            return false;
        }
    }
}

// Exportamos una instancia de la clase para reutilizarla
export const userService = new UserService();
