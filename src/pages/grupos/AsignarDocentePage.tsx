import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Stepper from '../../components/common/Stepper';
import RulesPanel from '../../components/common/RulesPanel';
import StatusBadge from '../../components/common/StatusBadge';
import { semestersService } from '../../services/semestersService';
import { groupsService } from '../../services/groupsService';
import { teachersService } from '../../services/teachersService';
import { subjectsService } from '../../services/subjectsService';
import { enrollmentsService } from '../../services/enrollmentsService';
import { Semester } from '../../models/Academic';
import { Teacher } from '../../models/Operations';
import { buildGroupRows, fullName, GroupRow } from '../../utils/academicCatalog';
import { getApiErrorMessage, showErrorToast, showSuccessToast, showWarningToast } from '../../utils/toast';

const STEPS = ['Seleccionar semestre', 'Seleccionar grupo', 'Seleccionar docente', 'Confirmar asignación'];

const AsignarDocentePage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [groupRows, setGroupRows] = useState<GroupRow[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [semesterId, setSemesterId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupRow | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [success, setSuccess] = useState(false);

  const [groupSearch, setGroupSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [semestersData, groups, subjects, teachersData, enrollments] = await Promise.all([
        semestersService.list(),
        groupsService.list(),
        subjectsService.list(),
        teachersService.list(),
        enrollmentsService.list(),
      ]);
      setSemesters(semestersData);
      setGroupRows(buildGroupRows(groups, subjects, semestersData, teachersData, enrollments));
      setTeachers(teachersData);
      const active = semestersData.find((s) => s.is_active);
      if (active) setSemesterId(active.id);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeSemester = semesters.find((s) => s.id === semesterId);

  const groupsInSemester = useMemo(() => {
    let list = groupRows.filter((g) => g.semester_id === semesterId);
    const q = groupSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.group_code.toLowerCase().includes(q) ||
          (g.subject_name ?? '').toLowerCase().includes(q)
      );
    }
    if (subjectFilter) list = list.filter((g) => g.subject_id === subjectFilter);
    return list;
  }, [groupRows, semesterId, groupSearch, subjectFilter]);

  const subjectOptions = useMemo(() => {
    const ids = new Set(groupsInSemester.map((g) => g.subject_id));
    return groupRows
      .filter((g) => ids.has(g.subject_id))
      .map((g) => ({ id: g.subject_id, name: g.subject_name ?? '' }));
  }, [groupsInSemester, groupRows]);

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        fullName(t.first_name, t.last_name).toLowerCase().includes(q) ||
        t.identification.toLowerCase().includes(q)
    );
  }, [teachers, teacherSearch]);

  const confirmAssign = async () => {
    if (!selectedGroup?.id || !selectedTeacher?.id) return;
    try {
      await groupsService.assignTeacher(selectedGroup.id, selectedTeacher.id);
      showSuccessToast('Docente asignado correctamente');
      setSuccess(true);
      setStep(4);
      load();
    } catch (error) {
      const msg = getApiErrorMessage(error);
      if (msg.includes('already assigned to this group')) {
        showWarningToast('Misma asignación: el docente ya está asignado a este grupo');
      } else if (msg.includes('already has a group')) {
        showWarningToast('Docente ya asignado a otro grupo con la misma asignatura en el semestre');
      } else if (msg.includes('no subject')) {
        showErrorToast('Asignatura no definida en el grupo');
      } else {
        showErrorToast(msg);
      }
    }
  };

  const rules = [
    { id: '1', text: 'Solo grupos del semestre activo seleccionado', ok: !!semesterId },
    { id: '2', text: 'El grupo debe tener asignatura definida', ok: !!selectedGroup?.subject_id },
    { id: '3', text: 'Un docente no puede duplicar asignatura en el mismo semestre', ok: true },
    { id: '4', text: 'La asignación notifica al docente', ok: step === 4 && success },
  ];

  const renderMain = () => {
    if (loading) return <div className="edugest-empty">Cargando...</div>;

    if (step === 1) {
      return (
        <>
          <p className="edugest-info-note">
            Solo se muestran grupos pertenecientes al semestre activo seleccionado.
          </p>
          <div className="edugest-field">
            <label>Semestre activo</label>
            <select
              className="edugest-select"
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>
          {activeSemester && (
            <div className="edugest-card edugest-card-body">
              <strong>{activeSemester.name}</strong>
              {activeSemester.is_active && <StatusBadge variant="success" label="Activo" />}
            </div>
          )}
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <div className="edugest-filters">
            <div className="edugest-field">
              <label>Buscar grupo</label>
              <input className="edugest-input" value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} />
            </div>
            <div className="edugest-field">
              <label>Asignatura</label>
              <select className="edugest-select" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                <option value="">Todas</option>
                {subjectOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="edugest-table-wrap">
            <table className="edugest-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Código grupo</th>
                  <th>Nombre</th>
                  <th>Asignatura</th>
                  <th>Cupos</th>
                  <th>Docente actual</th>
                </tr>
              </thead>
              <tbody>
                {groupsInSemester.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <input
                        type="radio"
                        name="group"
                        checked={selectedGroup?.id === g.id}
                        onChange={() => setSelectedGroup(g)}
                      />
                    </td>
                    <td>{g.group_code}</td>
                    <td>{g.name}</td>
                    <td>
                      {g.subject_name} ({g.subject_code})
                    </td>
                    <td>
                      {g.enrolled_count ?? 0}/{g.capacity}
                    </td>
                    <td>
                      {g.teacher_name ? (
                        g.teacher_name
                      ) : (
                        <span className="edugest-unassigned">Sin asignar</span>
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

    if (step === 3) {
      return (
        <>
          <div className="edugest-field">
            <label>Buscar docente</label>
            <input
              className="edugest-input"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Nombre o cédula"
            />
          </div>
          <div className="edugest-table-wrap">
            <table className="edugest-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Docente</th>
                  <th>Cédula</th>
                  <th>Especialidad</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <input
                        type="radio"
                        name="teacher"
                        checked={selectedTeacher?.id === t.id}
                        onChange={() => setSelectedTeacher(t)}
                      />
                    </td>
                    <td>{fullName(t.first_name, t.last_name)}</td>
                    <td>{t.identification}</td>
                    <td>{t.specialty ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }

    if (success) {
      return (
        <div className="edugest-success-screen">
          <div className="edugest-success-icon">
            <FiCheck />
          </div>
          <h2>Docente asignado correctamente</h2>
          <div className="edugest-card edugest-card-body">
            <p>
              <strong>Semestre:</strong> {activeSemester?.name}
            </p>
            <p>
              <strong>Grupo:</strong> {selectedGroup?.name} ({selectedGroup?.group_code})
            </p>
            <p>
              <strong>Asignatura:</strong> {selectedGroup?.subject_name}
            </p>
            <p>
              <strong>Docente:</strong> {selectedTeacher && fullName(selectedTeacher.first_name, selectedTeacher.last_name)} —{' '}
              {selectedTeacher?.identification}
            </p>
          </div>
          <button type="button" className="edugest-btn edugest-btn-primary" onClick={() => window.location.reload()}>
            Cerrar
          </button>
        </div>
      );
    }

    return (
      <>
        <p className="edugest-info-note">Revise los datos antes de confirmar la asignación.</p>
        <div className="edugest-card edugest-card-body">
          <div className="edugest-detail-row">
            <span className="edugest-detail-label">Semestre</span>
            <span>{activeSemester?.name}</span>
          </div>
          <div className="edugest-detail-row">
            <span className="edugest-detail-label">Grupo</span>
            <span>
              {selectedGroup?.name} ({selectedGroup?.group_code})
            </span>
          </div>
          <div className="edugest-detail-row">
            <span className="edugest-detail-label">Asignatura</span>
            <span>{selectedGroup?.subject_name}</span>
          </div>
          <div className="edugest-detail-row">
            <span className="edugest-detail-label">Docente a asignar</span>
            <span>
              {selectedTeacher && fullName(selectedTeacher.first_name, selectedTeacher.last_name)} —{' '}
              {selectedTeacher?.identification}
            </span>
          </div>
        </div>
      </>
    );
  };

  const summaryPanel = selectedGroup && (
    <div className="edugest-summary-panel">
      <h3>Detalles del grupo seleccionado</h3>
      <div className="edugest-detail-row">
        <span className="edugest-detail-label">Grupo</span>
        <span>{selectedGroup.name}</span>
      </div>
      <div className="edugest-detail-row">
        <span className="edugest-detail-label">Asignatura</span>
        <span>{selectedGroup.subject_name}</span>
      </div>
      <div className="edugest-detail-row">
        <span className="edugest-detail-label">Semestre</span>
        <span>{selectedGroup.semester_name}</span>
      </div>
      <div className="edugest-detail-row">
        <span className="edugest-detail-label">Cupos</span>
        <span>
          {selectedGroup.enrolled_count}/{selectedGroup.capacity}
        </span>
      </div>
      <div className="edugest-detail-row">
        <span className="edugest-detail-label">Docente actual</span>
        <span>
          {selectedGroup.teacher_name ?? <span className="edugest-unassigned">Sin asignar</span>}
        </span>
      </div>
      <p className="edugest-info-note">Seleccione un docente en el paso 3 para completar la asignación.</p>
    </div>
  );

  const canNext =
    (step === 1 && semesterId) ||
    (step === 2 && selectedGroup) ||
    (step === 3 && selectedTeacher);

  return (
    <div className="edugest-page">
      <PageHeader
        title="Asignar docente a grupo"
        breadcrumbs={[
          { label: 'Inicio', to: '/usuarios' },
          { label: 'Grupos' },
          { label: 'Asignar docente' },
        ]}
      />

      <Stepper steps={STEPS} currentStep={step} />

      <div className="edugest-wizard-layout">
        <div className="edugest-card edugest-card-body">
          {renderMain()}
          {!success && (
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
                <button type="button" className="edugest-btn edugest-btn-primary" onClick={confirmAssign}>
                  Confirmar asignación
                </button>
              )}
            </div>
          )}
        </div>
        <div>
          <RulesPanel title="Reglas de asignación" rules={rules} />
          {step >= 2 && summaryPanel}
        </div>
      </div>
    </div>
  );
};

export default AsignarDocentePage;
