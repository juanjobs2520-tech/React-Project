import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Criterion, Rubric, Scale } from '../models/Evaluation';
import { demoDataStore } from '../mocks/demoDataStore';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class RubricsService {
  async list(): Promise<Rubric[]> {
    try {
      const response = await apiClient.get<ApiResponse<Rubric[]>>('/evaluation/rubrics');
      const apiItems = unwrap(response.data) ?? [];
      return apiItems.length ? apiItems : demoDataStore.listRubrics();
    } catch {
      return demoDataStore.listRubrics();
    }
  }

  async getById(id: string): Promise<Rubric> {
    try {
      const response = await apiClient.get<ApiResponse<Rubric>>(`/evaluation/rubrics/${id}`);
      return unwrap(response.data);
    } catch {
      const item = demoDataStore.listRubrics().find((rubric) => rubric.id === id);
      if (!item) throw new Error('Rubrica no encontrada');
      return item;
    }
  }

  async create(payload: Partial<Rubric>): Promise<Rubric> {
    try {
      const response = await apiClient.post<ApiResponse<Rubric>>('/evaluation/rubrics', payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveRubric({ ...payload, is_public: payload.is_public ?? false });
    }
  }

  async update(id: string, payload: Partial<Rubric>): Promise<Rubric> {
    try {
      const response = await apiClient.put<ApiResponse<Rubric>>(`/evaluation/rubrics/${id}`, payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveRubric(payload, id);
    }
  }

  async publish(id: string): Promise<Rubric> {
    try {
      const response = await apiClient.patch<ApiResponse<Rubric>>(`/evaluation/rubrics/${id}/publish`);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveRubric({ is_public: true }, id);
    }
  }

  async listCriteria(): Promise<Criterion[]> {
    try {
      const response = await apiClient.get<ApiResponse<Criterion[]>>('/evaluation/criteria');
      const apiItems = unwrap(response.data) ?? [];
      return apiItems.length ? apiItems : demoDataStore.listCriteria();
    } catch {
      return demoDataStore.listCriteria();
    }
  }

  async addCriterion(payload: Partial<Criterion>): Promise<Criterion> {
    try {
      const response = await apiClient.post<ApiResponse<Criterion>>('/evaluation/criteria', payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveCriterion(payload);
    }
  }

  async updateCriterion(id: string, payload: Partial<Criterion>): Promise<Criterion> {
    try {
      const response = await apiClient.put<ApiResponse<Criterion>>(`/evaluation/criteria/${id}`, payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveCriterion(payload, id);
    }
  }

  async deleteCriterion(id: string): Promise<void> {
    try {
      await apiClient.delete(`/evaluation/criteria/${id}`);
    } catch {
      demoDataStore.removeCriterion(id);
    }
  }

  async listScales(): Promise<Scale[]> {
    try {
      const response = await apiClient.get<ApiResponse<Scale[]>>('/evaluation/scales');
      const apiItems = unwrap(response.data) ?? [];
      return apiItems.length ? apiItems : demoDataStore.listScales();
    } catch {
      return demoDataStore.listScales();
    }
  }

  async addScale(payload: Partial<Scale>): Promise<Scale> {
    try {
      const response = await apiClient.post<ApiResponse<Scale>>('/evaluation/scales', payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveScale(payload);
    }
  }

  async updateScale(id: string, payload: Partial<Scale>): Promise<Scale> {
    try {
      const response = await apiClient.put<ApiResponse<Scale>>(`/evaluation/scales/${id}`, payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveScale(payload, id);
    }
  }

  async deleteScale(id: string): Promise<void> {
    try {
      await apiClient.delete(`/evaluation/scales/${id}`);
    } catch {
      demoDataStore.removeScale(id);
    }
  }
}

export const rubricsService = new RubricsService();
