import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Student } from '../models/Operations';
import { demoDataStore } from '../mocks/demoDataStore';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class StudentsService {
  async list(): Promise<Student[]> {
    try {
      const response = await apiClient.get<ApiResponse<Student[]>>('/academic/students');
      const apiItems = unwrap(response.data) ?? [];
      return apiItems.length ? apiItems : demoDataStore.listStudents();
    } catch {
      return demoDataStore.listStudents();
    }
  }

  async search(params: Record<string, string>): Promise<Student[]> {
    try {
      const response = await apiClient.get<ApiResponse<Student[]>>('/academic/students/search', {
        params,
      });
      const apiItems = unwrap(response.data) ?? [];
      if (apiItems.length) return apiItems;
    } catch {
      // fallback to frontend demo data
    }
    const q = Object.values(params).join(' ').toLowerCase().trim();
    if (!q) return demoDataStore.listStudents();
    return demoDataStore
      .listStudents()
      .filter((student) => `${student.first_name} ${student.last_name} ${student.identification}`.toLowerCase().includes(q));
  }
}

export const studentsService = new StudentsService();
