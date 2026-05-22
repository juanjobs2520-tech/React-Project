import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Criterion, Rubric, Scale } from '../models/Evaluation';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class RubricsService {
  async list(): Promise<Rubric[]> {
    const response = await apiClient.get<ApiResponse<Rubric[]>>('/evaluation/rubrics');
    return unwrap(response.data) ?? [];
  }

  async getById(id: string): Promise<Rubric> {
    const response = await apiClient.get<ApiResponse<Rubric>>(`/evaluation/rubrics/${id}`);
    return unwrap(response.data);
  }

  async create(payload: Partial<Rubric>): Promise<Rubric> {
    const response = await apiClient.post<ApiResponse<Rubric>>('/evaluation/rubrics', payload);
    return unwrap(response.data);
  }

  async update(id: string, payload: Partial<Rubric>): Promise<Rubric> {
    const response = await apiClient.put<ApiResponse<Rubric>>(`/evaluation/rubrics/${id}`, payload);
    return unwrap(response.data);
  }

  async publish(id: string): Promise<Rubric> {
    const response = await apiClient.patch<ApiResponse<Rubric>>(`/evaluation/rubrics/${id}/publish`);
    return unwrap(response.data);
  }

  async listCriteria(): Promise<Criterion[]> {
    const response = await apiClient.get<ApiResponse<Criterion[]>>('/evaluation/criteria');
    return unwrap(response.data) ?? [];
  }

  async addCriterion(payload: Partial<Criterion>): Promise<Criterion> {
    const response = await apiClient.post<ApiResponse<Criterion>>('/evaluation/criteria', payload);
    return unwrap(response.data);
  }

  async updateCriterion(id: string, payload: Partial<Criterion>): Promise<Criterion> {
    const response = await apiClient.put<ApiResponse<Criterion>>(`/evaluation/criteria/${id}`, payload);
    return unwrap(response.data);
  }

  async deleteCriterion(id: string): Promise<void> {
    await apiClient.delete(`/evaluation/criteria/${id}`);
  }

  async listScales(): Promise<Scale[]> {
    const response = await apiClient.get<ApiResponse<Scale[]>>('/evaluation/scales');
    return unwrap(response.data) ?? [];
  }

  async addScale(payload: Partial<Scale>): Promise<Scale> {
    const response = await apiClient.post<ApiResponse<Scale>>('/evaluation/scales', payload);
    return unwrap(response.data);
  }

  async updateScale(id: string, payload: Partial<Scale>): Promise<Scale> {
    const response = await apiClient.put<ApiResponse<Scale>>(`/evaluation/scales/${id}`, payload);
    return unwrap(response.data);
  }

  async deleteScale(id: string): Promise<void> {
    await apiClient.delete(`/evaluation/scales/${id}`);
  }
}

export const rubricsService = new RubricsService();
