import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Subject } from '../models/Academic';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class SubjectsService {
  async list(): Promise<Subject[]> {
    const response = await apiClient.get<ApiResponse<Subject[]>>('/academic/subjects');
    return unwrap(response.data) ?? [];
  }

  async getById(id: string): Promise<Subject> {
    const response = await apiClient.get<ApiResponse<Subject>>(`/academic/subjects/${id}`);
    return unwrap(response.data);
  }

  async create(payload: Partial<Subject>): Promise<Subject> {
    const response = await apiClient.post<ApiResponse<Subject>>('/academic/subjects', payload);
    return unwrap(response.data);
  }

  async update(id: string, payload: Partial<Subject>): Promise<Subject> {
    const response = await apiClient.put<ApiResponse<Subject>>(`/academic/subjects/${id}`, payload);
    return unwrap(response.data);
  }

  async search(params: Record<string, string>): Promise<Subject[]> {
    const response = await apiClient.get<ApiResponse<Subject[]>>('/academic/subjects/search', { params });
    return unwrap(response.data) ?? [];
  }
}

export const subjectsService = new SubjectsService();
