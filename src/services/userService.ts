import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { CreateUserPayload, User, UserSearchParams } from '../models/User';

const API_URL = '/users';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class UserService {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>(`${API_URL}/`);
    return unwrap(response.data) ?? [];
  }

  async searchUsers(params: UserSearchParams): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>(`${API_URL}/search`, { params });
    return unwrap(response.data) ?? [];
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(`${API_URL}/${id}`);
      return unwrap(response.data);
    } catch {
      return null;
    }
  }

  async createUser(user: CreateUserPayload): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(`${API_URL}/`, user);
    return unwrap(response.data);
  }

  async updateUser(id: string, user: Partial<User & CreateUserPayload>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`${API_URL}/${id}`, user);
    return unwrap(response.data);
  }

  async deactivateUser(id: string): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(`${API_URL}/${id}/deactivate`);
    return unwrap(response.data);
  }
}

export const userService = new UserService();
