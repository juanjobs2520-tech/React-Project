import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { AcademicGroup } from '../models/Operations';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class GroupsService {
  async list(): Promise<AcademicGroup[]> {
    const response = await apiClient.get<ApiResponse<AcademicGroup[]>>('/academic/groups');
    return unwrap(response.data) ?? [];
  }

  async getById(id: string): Promise<AcademicGroup> {
    const response = await apiClient.get<ApiResponse<AcademicGroup>>(`/academic/groups/${id}`);
    return unwrap(response.data);
  }

  async assignTeacher(groupId: string, teacherId: string): Promise<AcademicGroup> {
    const response = await apiClient.patch<ApiResponse<AcademicGroup>>(
      `/academic/groups/${groupId}/assign-teacher/${teacherId}`
    );
    return unwrap(response.data);
  }

  async search(params: Record<string, string>): Promise<AcademicGroup[]> {
    const response = await apiClient.get<ApiResponse<AcademicGroup[]>>('/academic/groups/search', {
      params,
    });
    return unwrap(response.data) ?? [];
  }
}

export const groupsService = new GroupsService();
