import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Career } from '../models/Academic';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class CareersService {
  async list(): Promise<Career[]> {
    const response = await apiClient.get<ApiResponse<Career[]>>('/academic/careers');
    return unwrap(response.data) ?? [];
  }

  async getById(id: string): Promise<Career> {
    const response = await apiClient.get<ApiResponse<Career>>(`/academic/careers/${id}`);
    return unwrap(response.data);
  }

  async create(payload: Partial<Career>): Promise<Career> {
    const response = await apiClient.post<ApiResponse<Career>>('/academic/careers', payload);
    return unwrap(response.data);
  }

  async update(id: string, payload: Partial<Career>): Promise<Career> {
    const response = await apiClient.put<ApiResponse<Career>>(`/academic/careers/${id}`, payload);
    return unwrap(response.data);
  }

  async search(params: Record<string, string>): Promise<Career[]> {
    const response = await apiClient.get<ApiResponse<Career[]>>('/academic/careers/search', { params });
    return unwrap(response.data) ?? [];
  }
}

export const careersService = new CareersService();
