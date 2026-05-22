export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface TeacherProfile {
  id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  identification: string;
  specialty?: string;
}

export interface StudentProfile {
  id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  identification: string;
}

export interface User {
  id?: string;
  email?: string;
  password?: string;
  code?: string;
  role?: UserRole | string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  profile?: TeacherProfile | StudentProfile | Record<string, unknown>;
  first_name?: string;
  last_name?: string;
  identification?: string;
  phone?: string;
  specialty?: string;
  career_name?: string;
}

export interface UserSearchParams {
  role?: string;
  is_active?: string;
  email?: string;
  code?: string;
  identification?: string;
  first_name?: string;
  last_name?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  code: string;
  role: 'TEACHER' | 'STUDENT';
  first_name: string;
  last_name: string;
  identification: string;
  phone?: string;
  specialty?: string;
}
