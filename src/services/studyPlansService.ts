import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { StudyPlan, Subject } from '../models/Academic';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class StudyPlansService {
  async list(): Promise<StudyPlan[]> {
    const response = await apiClient.get<ApiResponse<StudyPlan[]>>('/academic/study-plans');
    return unwrap(response.data) ?? [];
  }

  async getById(id: string): Promise<StudyPlan> {
    const response = await apiClient.get<ApiResponse<StudyPlan>>(`/academic/study-plans/${id}`);
    return unwrap(response.data);
  }

  async create(payload: Partial<StudyPlan>): Promise<StudyPlan> {
    const response = await apiClient.post<ApiResponse<StudyPlan>>('/academic/study-plans', payload);
    return unwrap(response.data);
  }

  async update(id: string, payload: Partial<StudyPlan>): Promise<StudyPlan> {
    const response = await apiClient.put<ApiResponse<StudyPlan>>(`/academic/study-plans/${id}`, payload);
    return unwrap(response.data);
  }

  async listSubjects(studyPlanId: string): Promise<Subject[]> {
    const response = await apiClient.get<ApiResponse<Subject[]>>(
      `/academic/study-plans/${studyPlanId}/subjects`
    );
    return unwrap(response.data) ?? [];
  }

  async addSubject(studyPlanId: string, subjectId: string): Promise<unknown> {
    const response = await apiClient.post(
      `/academic/study-plans/${studyPlanId}/subjects/${subjectId}`
    );
    return unwrap(response.data);
  }

  async removeSubject(studyPlanId: string, subjectId: string): Promise<unknown> {
    const response = await apiClient.delete(
      `/academic/study-plans/${studyPlanId}/subjects/${subjectId}`
    );
    return unwrap(response.data);
  }
}

export const studyPlansService = new StudyPlansService();
