import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Teacher } from '../models/Operations';
import { demoDataStore } from '../mocks/demoDataStore';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class TeachersService {
  async list(): Promise<Teacher[]> {
    try {
      const response = await apiClient.get<ApiResponse<Teacher[]>>('/academic/teachers');
      const apiItems = unwrap(response.data) ?? [];
      return apiItems.length ? apiItems : demoDataStore.listTeachers();
    } catch {
      return demoDataStore.listTeachers();
    }
  }

  async search(params: Record<string, string>): Promise<Teacher[]> {
    try {
      const response = await apiClient.get<ApiResponse<Teacher[]>>('/academic/teachers/search', {
        params,
      });
      const apiItems = unwrap(response.data) ?? [];
      if (apiItems.length) return apiItems;
    } catch {
      // fallback to frontend demo data
    }
    const q = Object.values(params).join(' ').toLowerCase().trim();
    if (!q) return demoDataStore.listTeachers();
    return demoDataStore
      .listTeachers()
      .filter((teacher) =>
        `${teacher.first_name} ${teacher.last_name} ${teacher.identification} ${teacher.specialty ?? ''}`
          .toLowerCase()
          .includes(q)
      );
  }
}

export const teachersService = new TeachersService();
