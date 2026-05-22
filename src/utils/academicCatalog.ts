import { Career, Semester, Subject } from '../models/Academic';
import { AcademicGroup, Enrollment, Registration, Student, Teacher } from '../models/Operations';
import { User } from '../models/User';

export interface GroupRow extends AcademicGroup {
  subject_name?: string;
  subject_code?: string;
  subject_credits?: number;
  semester_name?: string;
  teacher_name?: string;
  teacher_identification?: string;
  career_name?: string;
  enrolled_count?: number;
}

export interface StudentRow extends Student {
  email?: string;
  phone?: string;
  career_name?: string;
  academic_status?: string;
  is_active_user?: boolean;
}

export const fullName = (first?: string, last?: string) =>
  `${first ?? ''} ${last ?? ''}`.trim() || '—';

export const buildGroupRows = (
  groups: AcademicGroup[],
  subjects: Subject[],
  semesters: Semester[],
  teachers: Teacher[],
  enrollments: Enrollment[]
): GroupRow[] => {
  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s]));
  const semesterMap = Object.fromEntries(semesters.map((s) => [s.id, s]));
  const teacherMap = Object.fromEntries(teachers.map((t) => [t.id, t]));
  const countByGroup: Record<string, number> = {};
  enrollments
    .filter((e) => e.status === 'ACTIVE')
    .forEach((e) => {
      countByGroup[e.group_id] = (countByGroup[e.group_id] ?? 0) + 1;
    });

  return groups.map((g) => {
    const subject = subjectMap[g.subject_id];
    const teacher = teacherMap[g.teacher_id];
    return {
      ...g,
      subject_name: subject?.name,
      subject_code: subject?.code,
      subject_credits: subject?.credits,
      semester_name: semesterMap[g.semester_id]?.name,
      teacher_name: teacher ? fullName(teacher.first_name, teacher.last_name) : undefined,
      teacher_identification: teacher?.identification,
      enrolled_count: countByGroup[g.id] ?? 0,
    };
  });
};

export const buildStudentRows = (
  students: Student[],
  users: User[],
  registrations: Registration[],
  careers: Career[]
): StudentRow[] => {
  const userById = Object.fromEntries(users.filter((u) => u.id).map((u) => [u.id!, u]));
  const careerMap = Object.fromEntries(careers.map((c) => [c.id, c.name]));
  const activeRegByStudent: Record<string, Registration> = {};
  registrations
    .filter((r) => r.is_active)
    .forEach((r) => {
      activeRegByStudent[r.student_id] = r;
    });

  return students.map((s) => {
    const user = userById[s.user_id];
    const reg = activeRegByStudent[s.id];
    return {
      ...s,
      email: user?.email,
      is_active_user: user?.is_active !== false,
      career_name: reg ? careerMap[reg.career_id] : undefined,
      academic_status: reg?.academic_status,
    };
  });
};

export const periodRegex = /^\d{4}-[12]$/;

export const validateAdmissionPeriod = (period: string): boolean => periodRegex.test(period);
