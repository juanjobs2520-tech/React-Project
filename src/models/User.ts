export interface User {
    id?: number;
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
    code?: string;
    role?: string;
    first_name?: string;
    last_name?: string;
    identification?: string;
    specialty?: string;
    profile?: Record<string, any>;
}