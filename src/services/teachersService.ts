import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Teacher } from '../models/Operations';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class TeachersService {
  async list(): Promise<Teacher[]> {
    const response = await apiClient.get<ApiResponse<Teacher[]>>('/academic/teachers');
    return unwrap(response.data) ?? [];
  }

  async search(params: Record<string, string>): Promise<Teacher[]> {
    const response = await apiClient.get<ApiResponse<Teacher[]>>('/academic/teachers/search', {
      params,
    });
    return unwrap(response.data) ?? [];
  }
}

export const teachersService = new TeachersService();
