import { apiClient } from './api';

class AcademicService {
  async createCareer(payload: Record<string, unknown>) {
    return apiClient.post('/academic/careers', payload).then((res) => res.data.data);
  }

  async createSemester(payload: Record<string, unknown>) {
    return apiClient.post('/academic/semesters', payload).then((res) => res.data.data);
  }

  async createSubject(payload: Record<string, unknown>) {
    return apiClient.post('/academic/subjects', payload).then((res) => res.data.data);
  }

  async createStudyPlan(payload: Record<string, unknown>) {
    return apiClient.post('/academic/study-plans', payload).then((res) => res.data.data);
  }

  async addSubjectToStudyPlan(studyPlanId: string, subjectId: string) {
    return apiClient
      .post(`/academic/study-plans/${studyPlanId}/subjects/${subjectId}`)
      .then((res) => res.data.data);
  }

  async createGroup(payload: Record<string, unknown>) {
    return apiClient.post('/academic/groups', payload).then((res) => res.data.data);
  }

  async assignTeacher(groupId: string, teacherId: string) {
    return apiClient
      .patch(`/academic/groups/${groupId}/assign-teacher/${teacherId}`)
      .then((res) => res.data.data);
  }

  async createRegistration(payload: Record<string, unknown>) {
    return apiClient.post('/academic/registrations', payload).then((res) => res.data.data);
  }

  async createEnrollment(payload: Record<string, unknown>) {
    return apiClient.post('/academic/enrollments', payload).then((res) => res.data.data);
  }

  async listEntities(entityName: string) {
    return apiClient.get(`/academic/${entityName}`).then((res) => res.data.data);
  }

  async getEntity(entityName: string, entityId: string) {
    return apiClient.get(`/academic/${entityName}/${entityId}`).then((res) => res.data.data);
  }

  async updateEntity(entityName: string, entityId: string, payload: Record<string, unknown>) {
    return apiClient.put(`/academic/${entityName}/${entityId}`, payload).then((res) => res.data.data);
  }

  async deleteEntity(entityName: string, entityId: string) {
    return apiClient.delete(`/academic/${entityName}/${entityId}`).then((res) => res.data.data);
  }

  async searchEntities(entityName: string, params: Record<string, unknown>) {
    return apiClient.get(`/academic/${entityName}/search`, { params }).then((res) => res.data.data);
  }
}

export const academicService = new AcademicService();
