import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Career } from '../models/Academic';
import { demoDataStore } from '../mocks/demoDataStore';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class CareersService {
  async list(): Promise<Career[]> {
    try {
      const response = await apiClient.get<ApiResponse<Career[]>>('/academic/careers');
      const apiItems = unwrap(response.data) ?? [];
      return apiItems.length ? apiItems : demoDataStore.listCareers();
    } catch {
      return demoDataStore.listCareers();
    }
  }

  async getById(id: string): Promise<Career> {
    try {
      const response = await apiClient.get<ApiResponse<Career>>(`/academic/careers/${id}`);
      return unwrap(response.data);
    } catch {
      const item = demoDataStore.listCareers().find((career) => career.id === id);
      if (!item) throw new Error('Carrera no encontrada');
      return item;
    }
  }

  async create(payload: Partial<Career>): Promise<Career> {
    try {
      const response = await apiClient.post<ApiResponse<Career>>('/academic/careers', payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveCareer({ ...payload, is_active: payload.is_active ?? true });
    }
  }

  async update(id: string, payload: Partial<Career>): Promise<Career> {
    try {
      const response = await apiClient.put<ApiResponse<Career>>(`/academic/careers/${id}`, payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveCareer(payload, id);
    }
  }

  async search(params: Record<string, string>): Promise<Career[]> {
    try {
      const response = await apiClient.get<ApiResponse<Career[]>>('/academic/careers/search', { params });
      const apiItems = unwrap(response.data) ?? [];
      if (apiItems.length) return apiItems;
    } catch {
      // fallback to frontend demo data
    }
    const q = Object.values(params).join(' ').toLowerCase().trim();
    if (!q) return demoDataStore.listCareers();
    return demoDataStore
      .listCareers()
      .filter((career) => `${career.name} ${career.code} ${career.description ?? ''}`.toLowerCase().includes(q));
  }
}

export const careersService = new CareersService();
