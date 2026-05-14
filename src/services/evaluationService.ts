import { apiClient } from './api';

class EvaluationService {
  async createRubric(payload: Record<string, unknown>) {
    return apiClient.post('/evaluation/rubrics', payload).then((res) => res.data.data);
  }

  async addCriterion(payload: Record<string, unknown>) {
    return apiClient.post('/evaluation/criteria', payload).then((res) => res.data.data);
  }

  async addScale(payload: Record<string, unknown>) {
    return apiClient.post('/evaluation/scales', payload).then((res) => res.data.data);
  }

  async publishRubric(rubricId: string) {
    return apiClient.patch(`/evaluation/rubrics/${rubricId}/publish`).then((res) => res.data.data);
  }

  async createEvaluation(payload: Record<string, unknown>) {
    return apiClient.post('/evaluation/evaluations', payload).then((res) => res.data.data);
  }

  async associateRubric(evaluationId: string, rubricId: string) {
    return apiClient
      .patch(`/evaluation/evaluations/${evaluationId}/associate-rubric/${rubricId}`)
      .then((res) => res.data.data);
  }

  async gradeStudent(payload: Record<string, unknown>) {
    return apiClient.post('/evaluation/grades', payload).then((res) => res.data.data);
  }

  async registerFinalScores(groupId: string) {
    return apiClient
      .post(`/evaluation/groups/${groupId}/register-final-scores`)
      .then((res) => res.data.data);
  }

  async listEntities(entityName: string) {
    return apiClient.get(`/evaluation/${entityName}`).then((res) => res.data.data);
  }

  async getEntity(entityName: string, entityId: string) {
    return apiClient.get(`/evaluation/${entityName}/${entityId}`).then((res) => res.data.data);
  }

  async updateEntity(entityName: string, entityId: string, payload: Record<string, unknown>) {
    return apiClient.put(`/evaluation/${entityName}/${entityId}`, payload).then((res) => res.data.data);
  }

  async deleteEntity(entityName: string, entityId: string) {
    return apiClient.delete(`/evaluation/${entityName}/${entityId}`).then((res) => res.data.data);
  }

  async searchEntities(entityName: string, params: Record<string, unknown>) {
    return apiClient.get(`/evaluation/${entityName}/search`, { params }).then((res) => res.data.data);
  }
}

export const evaluationService = new EvaluationService();
