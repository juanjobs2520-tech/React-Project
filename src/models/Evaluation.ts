export interface Rubric {
  id: string;
  title: string;
  description?: string;
  is_public: boolean;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Criterion {
  id: string;
  rubric_id: string;
  name: string;
  description?: string;
  weight: number;
  created_at?: string;
}

export interface Scale {
  id: string;
  criterion_id: string;
  name: string;
  description?: string;
  value: number;
}

export interface Evaluation {
  id: string;
  subject_id: string;
  rubric_id?: string | null;
  group_id: string;
  name: string;
  description?: string;
  weight: number;
  created_at?: string;
}

export interface GradeDetail {
  id?: string;
  scale_id: string;
  student_id: string;
  score: number;
  comment?: string;
}

export interface Grade {
  id: string;
  enrollment_id: string;
  rubric_id: string;
  final_score: number;
  status: string;
  observations?: string;
  is_locked: boolean;
  details?: GradeDetail[];
  created_at?: string;
  updated_at?: string;
}

export interface GradePayload {
  enrollment_id: string;
  evaluation_id?: string;
  rubric_id?: string;
  details: { scale_id: string; comment?: string }[];
  status?: 'DRAFT' | 'SENT';
  observations?: string;
}
