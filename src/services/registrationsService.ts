import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Registration } from '../models/Operations';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class RegistrationsService {
  async list(): Promise<Registration[]> {
    const response = await apiClient.get<ApiResponse<Registration[]>>('/academic/registrations');
    return unwrap(response.data) ?? [];
  }

  async create(payload: {
    career_id: string;
    student_id: string;
    admission_period: string;
    academic_status: string;
    is_active?: boolean;
  }): Promise<Registration> {
    const response = await apiClient.post<ApiResponse<Registration>>('/academic/registrations', payload);
    return unwrap(response.data);
  }

  async update(id: string, payload: Partial<Registration>): Promise<Registration> {
    const response = await apiClient.put<ApiResponse<Registration>>(`/academic/registrations/${id}`, payload);
    return unwrap(response.data);
  }
}

export const registrationsService = new RegistrationsService();
