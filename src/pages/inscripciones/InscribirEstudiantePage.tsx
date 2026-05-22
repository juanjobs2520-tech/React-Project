import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Stepper from '../../components/common/Stepper';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { studentsService } from '../../services/studentsService';
import { userService } from '../../services/userService';
import { careersService } from '../../services/careersService';
import { registrationsService } from '../../services/registrationsService';
import { semestersService } from '../../services/semestersService';
import { groupsService } from '../../services/groupsService';
import { subjectsService } from '../../services/subjectsService';
import { teachersService } from '../../services/teachersService';
import { enrollmentsService } from '../../services/enrollmentsService';
import { Semester } from '../../models/Academic';
import { Registration } from '../../models/Operations';
import {
  buildGroupRows,
  buildStudentRows,
  fullName,
  GroupRow,
  StudentRow,
} from '../../utils/academicCatalog';
import { MAX_ENROLLMENT_CREDITS } from '../../models/Operations';
import { getApiErrorMessage, showErrorToast, showSuccessToast, showWarningToast } from '../../utils/toast';
import { formatDate } from '../../utils/userHelpers';
import { paginate } from '../../utils/pagination';

const STEPS = [
  'Buscar estudiante',
  'Revisar matrícula',
  'Seleccionar grupos',
  'Confirmar',
  'Resultado',
];

const InscribirEstudiantePage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [groupRows, setGroupRows] = useState<GroupRow[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [enrollments, setEnrollments] = useState<{ student_id: string; group_id: string; status: string }[]>([]);
  const [activeSemester, setActiveSemester] = useState<Semester | null>(null);
  const [careers, setCareers] = useState<{ id: string; name: string }[]>([]);

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [activeRegistration, setActiveRegistration] = useState<Registration | null>(null);

  const [groupSearch, setGroupSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [groupPage, setGroupPage] = useState(1);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [planWarningOpen, setPlanWarningOpen] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);
  const [skipPlanWarning, setSkipPlanWarning] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, users, careersData, regs, semesters, groups, subjects, teachers, enr] =
        await Promise.all([
          studentsService.list(),
          userService.getUsers(),
          careersService.list(),
          registrationsService.list(),
          semestersService.list(),
          groupsService.list(),
          subjectsService.list(),
          teachersService.list(),
          enrollmentsService.list(),
        ]);
      const studentUsers = users.filter((u) => u.role === 'STUDENT');
      setStudents(buildStudentRows(studentsData, studentUsers, regs, careersData));
      setGroupRows(buildGroupRows(groups, subjects, semesters, teachers, enr));
      setRegistrations(regs);
      setEnrollments(enr);
      setCareers(careersData.map((c) => ({ id: c.id, name: c.name })));
      setActiveSemester(semesters.find((s) => s.is_active) ?? null);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        fullName(s.first_name, s.last_name).toLowerCase().includes(q) ||
        s.identification.toLowerCase().includes(q)
    );
  }, [students, search]);

  useEffect(() => {
    if (!selectedStudent?.id) {
      setActiveRegistration(null);
      return;
    }
    const reg = registrations.find((r) => r.student_id === selectedStudent.id && r.is_active);
    setActiveRegistration(reg ?? null);
  }, [selectedStudent, registrations]);

  const studentEnrollmentGroupIds = useMemo(() => {
    if (!selectedStudent?.id) return new Set<string>();
    return new Set(
      enrollments.filter((e) => e.student_id === selectedStudent.id && e.status === 'ACTIVE').map((e) => e.group_id)
    );
  }, [enrollments, selectedStudent]);

  const availableGroups = useMemo(() => {
    if (!activeSemester) return [];
    let list = groupRows.filter((g) => g.semester_id === activeSemester.id);
    const q = groupSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          (g.subject_name ?? '').toLowerCase().includes(q) ||
          g.group_code.toLowerCase().includes(q)
      );
    }
    if (subjectFilter) list = list.filter((g) => g.subject_id === subjectFilter);
    return list;
  }, [groupRows, activeSemester, groupSearch, subjectFilter]);

  const pagedGroups = useMemo(() => paginate(availableGroups, groupPage, 8), [availableGroups, groupPage]);

  const selectedGroups = useMemo(
    () => groupRows.filter((g) => selectedGroupIds.includes(g.id)),
    [groupRows, selectedGroupIds]
  );

  const selectedCredits = useMemo(
    () => selectedGroups.reduce((sum, g) => sum + (g.subject_credits ?? 0), 0),
    [selectedGroups]
  );

  const remainingCredits = MAX_ENROLLMENT_CREDITS - selectedCredits;

  const validations = useMemo(
    () => [
      {
        id: 'reg',
        text: 'Matrícula activa',
        ok: !!activeRegistration,
      },
      {
        id: 'sem',
        text: 'Semestre activo disponible',
        ok: !!activeSemester,
      },
      {
        id: 'cred',
        text: `Créditos dentro del límite (${selectedCredits}/${MAX_ENROLLMENT_CREDITS})`,
        ok: selectedCredits <= MAX_ENROLLMENT_CREDITS && selectedCredits > 0,
      },
      {
        id: 'groups',
        text: 'Al menos un grupo seleccionado',
        ok: selectedGroupIds.length > 0,
      },
    ],
    [activeRegistration, activeSemester, selectedCredits, selectedGroupIds.length]
  );

  const toggleGroup = (group: GroupRow) => {
    if (studentEnrollmentGroupIds.has(group.id)) {
      showWarningToast('Ya inscrito en este grupo');
      return;
    }
    const available = group.capacity - (group.enrolled_count ?? 0);
    if (available <= 0 && !selectedGroupIds.includes(group.id)) {
      showErrorToast('Sin cupo disponible');
      return;
    }
    const adding = !selectedGroupIds.includes(group.id);
    if (adding) {
      const newCredits = selectedCredits + (group.subject_credits ?? 0);
      if (newCredits > MAX_ENROLLMENT_CREDITS) {
        showErrorToast('Créditos exceden el límite');
        return;
      }
      if (!skipPlanWarning) {
        setPendingGroupId(group.id);
        setPlanWarningOpen(true);
        return;
      }
    }
    setSelectedGroupIds((prev) =>
      prev.includes(group.id) ? prev.filter((id) => id !== group.id) : [...prev, group.id]
    );
  };

  const confirmAddFromWarning = () => {
    if (pendingGroupId) {
      setSelectedGroupIds((prev) => [...prev, pendingGroupId]);
    }
    setPlanWarningOpen(false);
    setPendingGroupId(null);
  };

  const submitEnrollments = async () => {
    if (!selectedStudent?.id) return;
    if (!activeRegistration) {
      showErrorToast('Sin matrícula activa');
      return;
    }
    try {
      let count = 0;
      for (const groupId of selectedGroupIds) {
        await enrollmentsService.create({ student_id: selectedStudent.id, group_id: groupId });
        count += 1;
      }
      setCreatedCount(count);
      setSuccess(true);
      setStep(5);
      setConfirmOpen(false);
      showSuccessToast(`${count} inscripción(es) creada(s)`);
      load();
    } catch (error) {
      const msg = getApiErrorMessage(error);
      if (msg.includes('already enrolled')) showWarningToast('Ya inscrito');
      else if (msg.includes('no available capacity')) showErrorToast('Sin cupo disponible');
      else if (msg.includes('active registration')) showErrorToast('Sin matrícula activa');
      else showErrorToast(msg);
    }
  };

  const careerName = careers.find((c) => c.id === activeRegistration?.career_id)?.name;

  const renderMain = () => {
    if (loading) return <div className="edugest-empty">Cargando...</div>;

    if (step === 5 && success) {
      return (
        <div className="edugest-success-screen">
          <div className="edugest-success-icon">
            <FiCheck />
          </div>
          <h2>{createdCount} inscripción(es) creada(s)</h2>
          <p>Semestre: {activeSemester?.name}</p>
          <p>Fecha: {formatDate(new Date().toISOString())}</p>
          <button type="button" className="edugest-btn edugest-btn-primary" onClick={() => window.location.reload()}>
            Cerrar
          </button>
        </div>
      );
    }

    if (step === 1) {
      return (
        <>
          <div className="edugest-field">
            <label>Buscar estudiante</label>
            <input className="edugest-input" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="edugest-table-wrap">
            <table className="edugest-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Estudiante</th>
                  <th>Cédula</th>
                  <th>Carrera</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <input
                        type="radio"
                        name="student"
                        checked={selectedStudent?.id === s.id}
                        onChange={() => setSelectedStudent(s)}
                      />
                    </td>
                    <td>{fullName(s.first_name, s.last_name)}</td>
                    <td>{s.identification}</td>
                    <td>{s.career_name ?? '—'}</td>
                    <td>
                      {s.is_active_user !== false ? (
                        <StatusBadge variant="success" label="Activo" />
                      ) : (
                        <StatusBadge variant="danger" label="Inactivo" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          {selectedStudent && (
            <div className="edugest-student-card">
              <div className="edugest-avatar">
                {`${selectedStudent.first_name?.[0] ?? ''}${selectedStudent.last_name?.[0] ?? ''}`}
              </div>
              <div>
                <strong>{fullName(selectedStudent.first_name, selectedStudent.last_name)}</strong>
                <p>Cédula: {selectedStudent.identification}</p>
              </div>
            </div>
          )}
          {activeRegistration ? (
            <div className="edugest-card edugest-card-body">
              <h3>Matrícula activa</h3>
              <div className="edugest-detail-row">
                <span className="edugest-detail-label">Carrera</span>
                <span>{careerName}</span>
              </div>
              <div className="edugest-detail-row">
                <span className="edugest-detail-label">Periodo</span>
                <span>{activeRegistration.admission_period}</span>
              </div>
              <div className="edugest-detail-row">
                <span className="edugest-detail-label">Estado académico</span>
                <span>{activeRegistration.academic_status}</span>
              </div>
              <StatusBadge variant="success" label="Elegible para inscripción" />
            </div>
          ) : (
            <p className="edugest-warning-note">El estudiante no tiene matrícula activa. No puede inscribirse.</p>
          )}
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <div className="edugest-filters">
            <div className="edugest-field">
              <label>Buscar</label>
              <input className="edugest-input" value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} />
            </div>
            <div className="edugest-field">
              <label>Asignatura</label>
              <select className="edugest-select" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                <option value="">Todas</option>
                {[...new Set(availableGroups.map((g) => g.subject_id))].map((id) => {
                  const g = availableGroups.find((x) => x.subject_id === id);
                  return (
                    <option key={id} value={id}>
                      {g?.subject_name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="edugest-table-wrap">
            <table className="edugest-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Grupo</th>
                  <th>Asignatura</th>
                  <th>Código</th>
                  <th>Docente</th>
                  <th>Cupos (Disp.)</th>
                  <th>Créditos</th>
                </tr>
              </thead>
              <tbody>
                {pagedGroups.map((g) => {
                  const disp = g.capacity - (g.enrolled_count ?? 0);
                  return (
                    <tr key={g.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedGroupIds.includes(g.id)}
                          onChange={() => toggleGroup(g)}
                        />
                      </td>
                      <td>{g.name}</td>
                      <td>{g.subject_name}</td>
                      <td>{g.subject_code}</td>
                      <td>{g.teacher_name ?? '—'}</td>
                      <td className={disp <= 3 ? 'edugest-cupos-low' : 'edugest-cupos-ok'}>
                        {disp}/{g.capacity}
                      </td>
                      <td>{g.subject_credits}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="edugest-pagination">
            <button
              type="button"
              className="edugest-btn edugest-btn-secondary"
              disabled={groupPage <= 1}
              onClick={() => setGroupPage((p) => p - 1)}
            >
              Anterior
            </button>
            <button
              type="button"
              className="edugest-btn edugest-btn-secondary"
              disabled={groupPage >= Math.ceil(availableGroups.length / 8)}
              onClick={() => setGroupPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      );
    }

    if (step === 4) {
      return (
        <div className="edugest-table-wrap">
          <table className="edugest-table">
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Asignatura</th>
                <th>Créditos</th>
              </tr>
            </thead>
            <tbody>
              {selectedGroups.map((g) => (
                <tr key={g.id}>
                  <td>{g.name}</td>
                  <td>{g.subject_name}</td>
                  <td>{g.subject_credits}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>
                  <strong>Total créditos</strong>
                </td>
                <td>
                  <strong>{selectedCredits}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      );
    }

    return null;
  };

  const canNext =
    (step === 1 && selectedStudent) ||
    (step === 2 && activeRegistration) ||
    (step === 3 && selectedGroupIds.length > 0 && selectedCredits <= MAX_ENROLLMENT_CREDITS) ||
    step === 4;

  return (
    <div className="edugest-page">
      <PageHeader
        title="Inscribir estudiante en grupo"
        breadcrumbs={[
          { label: 'Inicio', to: '/usuarios' },
          { label: 'Inscripciones' },
          { label: 'Inscribir' },
        ]}
      />

      <Stepper steps={STEPS} currentStep={step} />

      <div className="edugest-wizard-layout">
        <div className="edugest-card edugest-card-body">
          {renderMain()}
          {step < 5 && (
            <div className="edugest-modal-footer">
              {step > 1 && (
                <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setStep((s) => s - 1)}>
                  Atrás
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  className="edugest-btn edugest-btn-primary"
                  disabled={!canNext}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Siguiente
                </button>
              ) : (
                <button type="button" className="edugest-btn edugest-btn-primary" onClick={() => setConfirmOpen(true)}>
                  Confirmar inscripción
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="edugest-summary-panel">
            <h3>Semestre activo</h3>
            {activeSemester ? (
              <>
                <p>
                  {activeSemester.code} — {activeSemester.name}
                </p>
                <p>
                  {formatDate(activeSemester.start_date)} → {formatDate(activeSemester.end_date)}
                </p>
                <StatusBadge variant="success" label="Activo" />
              </>
            ) : (
              <p className="edugest-warning-note">No hay semestre activo</p>
            )}
          </div>

          <div className="edugest-summary-panel">
            <h3>Límite de créditos</h3>
            <p>Máximo: {MAX_ENROLLMENT_CREDITS}</p>
            <h3>Resumen de créditos</h3>
            <p>Seleccionados: {selectedCredits}</p>
            <p>Restantes: {remainingCredits}</p>
            <p className="edugest-credits-big">{selectedCredits}</p>
          </div>

          <div className="edugest-summary-panel">
            <h3>Validaciones</h3>
            <ul className="edugest-rules-list">
              {validations.map((v) => (
                <li key={v.id} className="edugest-rules-item">
                  <FiCheck className={v.ok ? 'edugest-rules-icon-ok' : 'edugest-rules-icon-warn'} />
                  {v.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        title="Confirmar inscripción"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </button>
            <button type="button" className="edugest-btn edugest-btn-primary" onClick={submitEnrollments}>
              Confirmar inscripción
            </button>
          </>
        }
      >
        <p>Estudiante: {selectedStudent && fullName(selectedStudent.first_name, selectedStudent.last_name)}</p>
        <p>Grupos: {selectedGroupIds.length} · Créditos: {selectedCredits}</p>
      </Modal>

      <Modal
        open={planWarningOpen}
        title="Advertencia: asignatura fuera del plan"
        onClose={() => setPlanWarningOpen(false)}
        footer={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setPlanWarningOpen(false)}>
              No inscribir
            </button>
            <button type="button" className="edugest-btn edugest-btn-warning" onClick={confirmAddFromWarning}>
              Continuar igualmente
            </button>
          </>
        }
      >
        <p className="edugest-warning-note">La asignatura podría no estar en el plan de estudios vigente del estudiante.</p>
        <label className="edugest-field">
          <input
            type="checkbox"
            checked={skipPlanWarning}
            onChange={(e) => setSkipPlanWarning(e.target.checked)}
          />{' '}
          No volver a mostrar
        </label>
      </Modal>
    </div>
  );
};

export default InscribirEstudiantePage;
