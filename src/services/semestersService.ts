import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Semester } from '../models/Academic';
import { demoDataStore } from '../mocks/demoDataStore';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class SemestersService {
  async list(): Promise<Semester[]> {
    try {
      const response = await apiClient.get<ApiResponse<Semester[]>>('/academic/semesters');
      const apiItems = unwrap(response.data) ?? [];
      return apiItems.length ? apiItems : demoDataStore.listSemesters();
    } catch {
      return demoDataStore.listSemesters();
    }
  }

  async create(payload: Partial<Semester>): Promise<Semester> {
    try {
      const response = await apiClient.post<ApiResponse<Semester>>('/academic/semesters', payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveSemester(payload);
    }
  }

  async update(id: string, payload: Partial<Semester>): Promise<Semester> {
    try {
      const response = await apiClient.put<ApiResponse<Semester>>(`/academic/semesters/${id}`, payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveSemester(payload, id);
    }
  }

  async search(params: Record<string, string>): Promise<Semester[]> {
    try {
      const response = await apiClient.get<ApiResponse<Semester[]>>('/academic/semesters/search', { params });
      const apiItems = unwrap(response.data) ?? [];
      if (apiItems.length) return apiItems;
    } catch {
      // fallback to frontend demo data
    }
    const q = Object.values(params).join(' ').toLowerCase().trim();
    if (!q) return demoDataStore.listSemesters();
    return demoDataStore.listSemesters().filter((semester) => `${semester.name} ${semester.code}`.toLowerCase().includes(q));
  }
}

export const semestersService = new SemestersService();
