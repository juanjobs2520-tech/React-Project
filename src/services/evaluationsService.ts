import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { Evaluation, Grade, GradePayload } from '../models/Evaluation';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class EvaluationsService {
  async list(): Promise<Evaluation[]> {
    const response = await apiClient.get<ApiResponse<Evaluation[]>>('/evaluation/evaluations');
    return unwrap(response.data) ?? [];
  }

  async getById(id: string): Promise<Evaluation> {
    const response = await apiClient.get<ApiResponse<Evaluation>>(`/evaluation/evaluations/${id}`);
    return unwrap(response.data);
  }

  async create(payload: Partial<Evaluation>): Promise<Evaluation> {
    const response = await apiClient.post<ApiResponse<Evaluation>>('/evaluation/evaluations', payload);
    return unwrap(response.data);
  }

  async update(id: string, payload: Partial<Evaluation>): Promise<Evaluation> {
    const response = await apiClient.put<ApiResponse<Evaluation>>(`/evaluation/evaluations/${id}`, payload);
    return unwrap(response.data);
  }

  async associateRubric(evaluationId: string, rubricId: string): Promise<Evaluation> {
    const response = await apiClient.patch<ApiResponse<Evaluation>>(
      `/evaluation/evaluations/${evaluationId}/associate-rubric/${rubricId}`
    );
    return unwrap(response.data);
  }

  async listGrades(): Promise<Grade[]> {
    const response = await apiClient.get<ApiResponse<Grade[]>>('/evaluation/grades');
    return unwrap(response.data) ?? [];
  }

  async getGrade(id: string): Promise<Grade> {
    const response = await apiClient.get<ApiResponse<Grade>>(`/evaluation/grades/${id}`);
    return unwrap(response.data);
  }

  async gradeStudent(payload: GradePayload): Promise<Grade> {
    const response = await apiClient.post<ApiResponse<Grade>>('/evaluation/grades', payload);
    return unwrap(response.data);
  }

  async registerFinalScores(groupId: string): Promise<
    { enrollment_id: string; student_id: string; official_final_score: number; evaluations_count: number }[]
  > {
    const response = await apiClient.post(`/evaluation/groups/${groupId}/register-final-scores`);
    return unwrap(response.data) ?? [];
  }
}

export const evaluationsService = new EvaluationsService();
