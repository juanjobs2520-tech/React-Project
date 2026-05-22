import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Semester } from '../models/Academic';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class SemestersService {
  async list(): Promise<Semester[]> {
    const response = await apiClient.get<ApiResponse<Semester[]>>('/academic/semesters');
    return unwrap(response.data) ?? [];
  }

  async create(payload: Partial<Semester>): Promise<Semester> {
    const response = await apiClient.post<ApiResponse<Semester>>('/academic/semesters', payload);
    return unwrap(response.data);
  }

  async update(id: string, payload: Partial<Semester>): Promise<Semester> {
    const response = await apiClient.put<ApiResponse<Semester>>(`/academic/semesters/${id}`, payload);
    return unwrap(response.data);
  }

  async search(params: Record<string, string>): Promise<Semester[]> {
    const response = await apiClient.get<ApiResponse<Semester[]>>('/academic/semesters/search', { params });
    return unwrap(response.data) ?? [];
  }
}

export const semestersService = new SemestersService();
