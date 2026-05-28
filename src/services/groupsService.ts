import { apiClient } from './api';
import { ApiResponse } from '../models/ApiResponse';
import { AcademicGroup } from '../models/Operations';
import { demoDataStore } from '../mocks/demoDataStore';

const unwrap = <T,>(data: ApiResponse<T> | T): T => {
  if (data && typeof data === 'object' && 'data' in (data as ApiResponse<T>)) {
    return (data as ApiResponse<T>).data as T;
  }
  return data as T;
};

class GroupsService {
  async list(): Promise<AcademicGroup[]> {
    try {
      const response = await apiClient.get<ApiResponse<AcademicGroup[]>>('/academic/groups');
      const apiItems = unwrap(response.data) ?? [];
      return apiItems.length ? apiItems : demoDataStore.listGroups();
    } catch {
      return demoDataStore.listGroups();
    }
  }

  async getById(id: string): Promise<AcademicGroup> {
    try {
      const response = await apiClient.get<ApiResponse<AcademicGroup>>(`/academic/groups/${id}`);
      return unwrap(response.data);
    } catch {
      const item = demoDataStore.listGroups().find((group) => group.id === id);
      if (!item) throw new Error('Grupo no encontrado');
      return item;
    }
  }

  async assignTeacher(groupId: string, teacherId: string): Promise<AcademicGroup> {
    try {
      const response = await apiClient.patch<ApiResponse<AcademicGroup>>(
        `/academic/groups/${groupId}/assign-teacher/${teacherId}`
      );
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveGroup({ teacher_id: teacherId }, groupId);
    }
  }

  async search(params: Record<string, string>): Promise<AcademicGroup[]> {
    try {
      const response = await apiClient.get<ApiResponse<AcademicGroup[]>>('/academic/groups/search', {
        params,
      });
      const apiItems = unwrap(response.data) ?? [];
      if (apiItems.length) return apiItems;
    } catch {
      // fallback to frontend demo data
    }
    const q = Object.values(params).join(' ').toLowerCase().trim();
    if (!q) return demoDataStore.listGroups();
    return demoDataStore
      .listGroups()
      .filter((group) => `${group.name} ${group.group_code}`.toLowerCase().includes(q));
  }

  async create(payload: Partial<AcademicGroup>): Promise<AcademicGroup> {
    try {
      const response = await apiClient.post<ApiResponse<AcademicGroup>>('/academic/groups', payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveGroup(payload);
    }
  }

  async update(id: string, payload: Partial<AcademicGroup>): Promise<AcademicGroup> {
    try {
      const response = await apiClient.put<ApiResponse<AcademicGroup>>(`/academic/groups/${id}`, payload);
      return unwrap(response.data);
    } catch {
      return demoDataStore.saveGroup(payload, id);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/academic/groups/${id}`);
    } catch {
      demoDataStore.removeGroup(id);
    }
  }
}

export const groupsService = new GroupsService();
