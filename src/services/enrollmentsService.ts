import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Enrollment } from '../models/Operations';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class EnrollmentsService {
  async list(): Promise<Enrollment[]> {
    const response = await apiClient.get<ApiResponse<Enrollment[]>>('/academic/enrollments');
    return unwrap(response.data) ?? [];
  }

  async create(payload: { student_id: string; group_id: string; status?: string }): Promise<Enrollment> {
    const response = await apiClient.post<ApiResponse<Enrollment>>('/academic/enrollments', payload);
    return unwrap(response.data);
  }

  async update(id: string, payload: Partial<Enrollment>): Promise<Enrollment> {
    const response = await apiClient.put<ApiResponse<Enrollment>>(`/academic/enrollments/${id}`, payload);
    return unwrap(response.data);
  }
}

export const enrollmentsService = new EnrollmentsService();
