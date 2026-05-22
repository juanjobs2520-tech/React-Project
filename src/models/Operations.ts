export interface Teacher {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  identification: string;
  specialty?: string;
  is_active?: boolean;
}

export interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  identification: string;
}

export interface AcademicGroup {
  id: string;
  teacher_id: string;
  subject_id: string;
  semester_id: string;
  name: string;
  group_code: string;
  capacity: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  group_id: string;
  enrollment_date?: string;
  status: string;
}

export interface Registration {
  id: string;
  career_id: string;
  student_id: string;
  admission_period: string;
  academic_status: string;
  is_active: boolean;
  created_at?: string;
}

export const ACADEMIC_STATUSES = ['Activo', 'Retirado', 'Suspendido', 'Egresado'] as const;
export const MAX_ENROLLMENT_CREDITS = 20;
