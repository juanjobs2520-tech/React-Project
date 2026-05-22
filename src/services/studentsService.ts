import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Student } from '../models/Operations';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class StudentsService {
  async list(): Promise<Student[]> {
    const response = await apiClient.get<ApiResponse<Student[]>>('/academic/students');
    return unwrap(response.data) ?? [];
  }

  async search(params: Record<string, string>): Promise<Student[]> {
    const response = await apiClient.get<ApiResponse<Student[]>>('/academic/students/search', {
      params,
    });
    return unwrap(response.data) ?? [];
  }
}

export const studentsService = new StudentsService();
