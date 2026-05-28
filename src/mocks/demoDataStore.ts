import { Career, Semester, Subject } from '../models/Academic';
import { Criterion, Rubric, Scale } from '../models/Evaluation';
import { AcademicGroup, Student, Teacher } from '../models/Operations';

interface DemoDb {
  careers: Career[];
  semesters: Semester[];
  subjects: Subject[];
  teachers: Teacher[];
  students: Student[];
  groups: AcademicGroup[];
  rubrics: Rubric[];
  criteria: Criterion[];
  scales: Scale[];
}

const STORAGE_KEY = 'edugest.demo.db.v1';

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const seedDb = (): DemoDb => {
  const created_at = nowIso();
  const careerSis = 'career-sis';
  const careerAdm = 'career-adm';
  const sem20241 = 'sem-2024-1';
  const sem20242 = 'sem-2024-2';
  const subjProg1 = 'subj-prog1';
  const subjBd = 'subj-bd';
  const subjAdmin = 'subj-admin';
  const teacher1 = 'teacher-1';
  const teacher2 = 'teacher-2';
  const student1 = 'student-1';
  const student2 = 'student-2';
  const group1 = 'group-1';
  const group2 = 'group-2';
  const rubric1 = 'rubric-1';
  const criterion1 = 'criterion-1';
  const criterion2 = 'criterion-2';

  return {
    careers: [
      { id: careerSis, name: 'Ingenieria de Sistemas', code: 'IS', description: 'Formacion en software y datos', is_active: true, created_at },
      { id: careerAdm, name: 'Administracion de Empresas', code: 'AE', description: 'Gestion y direccion empresarial', is_active: true, created_at },
    ],
    semesters: [
      { id: sem20241, code: '2024-1', name: 'Periodo 2024-1', start_date: '2024-01-15', end_date: '2024-06-30', is_active: false, created_at },
      { id: sem20242, code: '2024-2', name: 'Periodo 2024-2', start_date: '2024-07-15', end_date: '2024-12-01', is_active: true, created_at },
    ],
    subjects: [
      { id: subjProg1, name: 'Programacion I', code: 'PROG101', description: 'Fundamentos de programacion', credits: 4, is_active: true, created_at },
      { id: subjBd, name: 'Bases de Datos', code: 'BD102', description: 'Modelado y SQL', credits: 3, is_active: true, created_at },
      { id: subjAdmin, name: 'Administracion I', code: 'ADM101', description: 'Introduccion a la administracion', credits: 3, is_active: true, created_at },
    ],
    teachers: [
      { id: teacher1, user_id: 'u-t-1', first_name: 'Carlos Andres', last_name: 'Perez', identification: '10234567', specialty: 'Programacion', is_active: true },
      { id: teacher2, user_id: 'u-t-2', first_name: 'Maria Fernanda', last_name: 'Lopez', identification: '11234567', specialty: 'Bases de datos', is_active: true },
    ],
    students: [
      { id: student1, user_id: 'u-s-1', first_name: 'Jorge Luis', last_name: 'Ramirez', identification: '11098765' },
      { id: student2, user_id: 'u-s-2', first_name: 'Ana Camila', last_name: 'Diaz', identification: '11987654' },
    ],
    groups: [
      { id: group1, teacher_id: teacher1, subject_id: subjProg1, semester_id: sem20242, name: 'Sistemas 01 - Manana', group_code: 'ING-SIS-01', capacity: 35 },
      { id: group2, teacher_id: teacher2, subject_id: subjBd, semester_id: sem20242, name: 'Sistemas 02 - Tarde', group_code: 'ING-SIS-02', capacity: 30 },
    ],
    rubrics: [
      { id: rubric1, title: 'Rubrica Parcial 1 - Programacion I', description: 'Evaluacion de fundamentos', is_public: true, created_at },
    ],
    criteria: [
      { id: criterion1, rubric_id: rubric1, name: 'Logica de solucion', description: 'Plantea una solucion correcta', weight: 50, created_at },
      { id: criterion2, rubric_id: rubric1, name: 'Calidad de codigo', description: 'Codigo legible y estructurado', weight: 50, created_at },
    ],
    scales: [
      { id: 'scale-1', criterion_id: criterion1, name: 'Insuficiente', value: 1, description: 'No cumple lo minimo' },
      { id: 'scale-2', criterion_id: criterion1, name: 'Satisfactorio', value: 3, description: 'Cumple parcialmente' },
      { id: 'scale-3', criterion_id: criterion1, name: 'Excelente', value: 5, description: 'Cumple completamente' },
      { id: 'scale-4', criterion_id: criterion2, name: 'Insuficiente', value: 1, description: 'No cumple lo minimo' },
      { id: 'scale-5', criterion_id: criterion2, name: 'Satisfactorio', value: 3, description: 'Cumple parcialmente' },
      { id: 'scale-6', criterion_id: criterion2, name: 'Excelente', value: 5, description: 'Cumple completamente' },
    ],
  };
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const readDb = (): DemoDb => {
  if (typeof window === 'undefined') return seedDb();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const db = seedDb();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return db;
  }
  try {
    return JSON.parse(raw) as DemoDb;
  } catch {
    const db = seedDb();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return db;
  }
};

const writeDb = (db: DemoDb) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const updateList = <T extends { id: string }>(items: T[], payload: Partial<T>, id?: string): T => {
  if (id) {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Registro no encontrado');
    const updated = { ...items[index], ...payload } as T;
    items[index] = updated;
    return updated;
  }
  const created = { ...(payload as T), id: makeId('demo') } as T;
  items.unshift(created);
  return created;
};

export const demoDataStore = {
  ensureSeeded: () => {
    readDb();
  },
  listCareers: () => clone(readDb().careers),
  listSemesters: () => clone(readDb().semesters),
  listSubjects: () => clone(readDb().subjects),
  listTeachers: () => clone(readDb().teachers),
  listStudents: () => clone(readDb().students),
  listGroups: () => clone(readDb().groups),
  listRubrics: () => clone(readDb().rubrics),
  listCriteria: () => clone(readDb().criteria),
  listScales: () => clone(readDb().scales),
  saveCareer: (payload: Partial<Career>, id?: string) => {
    const db = readDb();
    const result = updateList(db.careers, payload, id);
    writeDb(db);
    return clone(result);
  },
  saveSemester: (payload: Partial<Semester>, id?: string) => {
    const db = readDb();
    if (payload.is_active) {
      db.semesters = db.semesters.map((semester) => ({ ...semester, is_active: false }));
    }
    const result = updateList(db.semesters, payload, id);
    writeDb(db);
    return clone(result);
  },
  saveSubject: (payload: Partial<Subject>, id?: string) => {
    const db = readDb();
    const result = updateList(db.subjects, payload, id);
    writeDb(db);
    return clone(result);
  },
  saveGroup: (payload: Partial<AcademicGroup>, id?: string) => {
    const db = readDb();
    const result = updateList(db.groups, payload, id);
    writeDb(db);
    return clone(result);
  },
  removeGroup: (id: string) => {
    const db = readDb();
    db.groups = db.groups.filter((group) => group.id !== id);
    writeDb(db);
  },
  saveRubric: (payload: Partial<Rubric>, id?: string) => {
    const db = readDb();
    const result = updateList(db.rubrics, payload, id);
    writeDb(db);
    return clone(result);
  },
  saveCriterion: (payload: Partial<Criterion>, id?: string) => {
    const db = readDb();
    const result = updateList(db.criteria, payload, id);
    writeDb(db);
    return clone(result);
  },
  removeCriterion: (id: string) => {
    const db = readDb();
    db.criteria = db.criteria.filter((criterion) => criterion.id !== id);
    db.scales = db.scales.filter((scale) => scale.criterion_id !== id);
    writeDb(db);
  },
  saveScale: (payload: Partial<Scale>, id?: string) => {
    const db = readDb();
    const result = updateList(db.scales, payload, id);
    writeDb(db);
    return clone(result);
  },
  removeScale: (id: string) => {
    const db = readDb();
    db.scales = db.scales.filter((scale) => scale.id !== id);
    writeDb(db);
  },
};
