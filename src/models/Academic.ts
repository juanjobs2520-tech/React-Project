export interface Career {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Semester {
  id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StudyPlan {
  id: string;
  career_id: string;
  name: string;
  year: number;
  suggested_semester?: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  career?: Career;
  subjects?: Subject[];
}
