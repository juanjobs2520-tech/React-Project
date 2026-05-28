import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Subject } from '../models/Academic';
import { demoDataStore } from '../mocks/demoDataStore';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class SubjectsService {
  async list(): Promise<Subject[]> {
    try {
      const response = await apiClient.get<ApiResponse<Subject[]>>('/academic/subjects');
      const apiItems = unwrap(response.data) ?? [];
      return apiItems.length ? apiItems : demoDataStore.listSubjects();
    } catch {
      return demoDataStore.listSubjects();
    }
  }

  async getById(id: string): Promise<Subject> {
    try {
      const response = await apiClient.get<ApiResponse<Subject>>(`/academic/subjects/${id}`);
      return unwrap(response.data);
    } catch {
      const item = demoDataStore.listSubjects().find((subject) => subject.id === id);
      if (!item) throw new Error('Asignatura no encontrada');
      return item;
    }
  }

  async create(payload: Partial<Subject>): Promise<Subject> {
    try {
      const response = await apiClient.post<ApiResponse<Subject>>('/academic/subjects', payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveSubject({ ...payload, is_active: payload.is_active ?? true });
    }
  }

  async update(id: string, payload: Partial<Subject>): Promise<Subject> {
    try {
      const response = await apiClient.put<ApiResponse<Subject>>(`/academic/subjects/${id}`, payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveSubject(payload, id);
    }
  }

  async search(params: Record<string, string>): Promise<Subject[]> {
    try {
      const response = await apiClient.get<ApiResponse<Subject[]>>('/academic/subjects/search', { params });
      const apiItems = unwrap(response.data) ?? [];
      if (apiItems.length) return apiItems;
    } catch {
      // fallback to frontend demo data
    }
    const q = Object.values(params).join(' ').toLowerCase().trim();
    if (!q) return demoDataStore.listSubjects();
    return demoDataStore
      .listSubjects()
      .filter((subject) => `${subject.name} ${subject.code} ${subject.description ?? ''}`.toLowerCase().includes(q));
  }
}

export const subjectsService = new SubjectsService();
