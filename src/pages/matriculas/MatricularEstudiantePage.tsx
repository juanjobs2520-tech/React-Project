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
import { Career } from '../../models/Academic';
import { Registration, ACADEMIC_STATUSES } from '../../models/Operations';
import { buildStudentRows, fullName, StudentRow, validateAdmissionPeriod } from '../../utils/academicCatalog';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../utils/toast';
import { formatDate } from '../../utils/userHelpers';

const STEPS = ['Buscar estudiante', 'Seleccionar carrera', 'Datos de matrícula', 'Confirmar'];

const MatricularEstudiantePage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [careerId, setCareerId] = useState('');
  const [admissionPeriod, setAdmissionPeriod] = useState('');
  const [academicStatus, setAcademicStatus] = useState<string>(ACADEMIC_STATUSES[0]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateReg, setDuplicateReg] = useState<Registration | null>(null);
  const [createdReg, setCreatedReg] = useState<Registration | null>(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, users, careersData, regs] = await Promise.all([
        studentsService.list(),
        userService.getUsers(),
        careersService.list(),
        registrationsService.list(),
      ]);
      const studentUsers = users.filter((u) => u.role === 'STUDENT');
      setStudents(buildStudentRows(studentsData, studentUsers, regs, careersData));
      setCareers(careersData.filter((c) => c.is_active));
      setRegistrations(regs);
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
        s.identification.toLowerCase().includes(q) ||
        (s.email ?? '').toLowerCase().includes(q)
    );
  }, [students, search]);

  const selectedCareer = careers.find((c) => c.id === careerId);

  const summaryRegistration = useMemo(
    () => ({
      student: selectedStudent ? fullName(selectedStudent.first_name, selectedStudent.last_name) : '—',
      career: selectedCareer?.name ?? '—',
      period: admissionPeriod || '—',
      status: academicStatus,
    }),
    [selectedStudent, selectedCareer, admissionPeriod, academicStatus]
  );

  const checkDuplicate = (): boolean => {
    if (!selectedStudent?.id || !careerId) return false;
    const dup = registrations.find(
      (r) => r.student_id === selectedStudent.id && r.career_id === careerId && r.is_active
    );
    if (dup) {
      setDuplicateReg(dup);
      setDuplicateOpen(true);
      return true;
    }
    return false;
  };

  const submitRegistration = async () => {
    if (!selectedStudent?.id || !careerId) return;
    if (!validateAdmissionPeriod(admissionPeriod)) {
      showErrorToast('Periodo de ingreso inválido. Use formato AAAA-N (ej: 2025-1)');
      return;
    }
    try {
      const created = await registrationsService.create({
        student_id: selectedStudent.id,
        career_id: careerId,
        admission_period: admissionPeriod,
        academic_status: academicStatus,
        is_active: true,
      });
      setCreatedReg(created);
      setSuccess(true);
      setConfirmOpen(false);
      showSuccessToast('Matrícula registrada correctamente');
      load();
    } catch (error) {
      const msg = getApiErrorMessage(error);
      if (msg.includes('active registration')) {
        showErrorToast('Matrícula duplicada');
        const dup = registrations.find(
          (r) => r.student_id === selectedStudent.id && r.career_id === careerId && r.is_active
        );
        setDuplicateReg(dup ?? null);
        setDuplicateOpen(true);
      } else {
        showErrorToast(msg);
      }
    }
  };

  const initials = (s: StudentRow) =>
    `${s.first_name?.[0] ?? ''}${s.last_name?.[0] ?? ''}`.toUpperCase();

  const renderStep = () => {
    if (loading) return <div className="edugest-empty">Cargando...</div>;

    if (success && createdReg) {
      return (
        <div className="edugest-success-screen">
          <div className="edugest-success-icon">
            <FiCheck />
          </div>
          <h2>Matrícula creada</h2>
          <div className="edugest-card edugest-card-body">
            <p>
              <strong>ID:</strong> {createdReg.id}
            </p>
            <p>
              <strong>Fecha:</strong> {formatDate(createdReg.created_at)}
            </p>
            <p>
              <strong>Estado:</strong> {createdReg.academic_status}
            </p>
            <p>
              <strong>Periodo:</strong> {createdReg.admission_period}
            </p>
          </div>
          <button type="button" className="edugest-btn edugest-btn-primary" onClick={() => window.location.reload()}>
            Cerrar
          </button>
        </div>
      );
    }

    if (step === 1) {
      return (
        <>
          <div className="edugest-filters">
            <div className="edugest-field">
              <label>Buscar estudiante</label>
              <input className="edugest-input" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="edugest-table-wrap">
            <table className="edugest-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Estudiante</th>
                  <th>Cédula</th>
                  <th>Carrera actual</th>
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

    if (step === 2 || step === 3) {
      return (
        <>
          {selectedStudent && (
            <div className="edugest-student-card">
              <div className="edugest-avatar">{initials(selectedStudent)}</div>
              <div>
                <strong>{fullName(selectedStudent.first_name, selectedStudent.last_name)}</strong>
                {selectedStudent.is_active_user !== false ? (
                  <StatusBadge variant="success" label="Activo" />
                ) : (
                  <StatusBadge variant="danger" label="Inactivo" />
                )}
                <p>Cédula: {selectedStudent.identification}</p>
                <p>Email: {selectedStudent.email ?? '—'}</p>
              </div>
            </div>
          )}
          <h3 className="edugest-page-title">Seleccionar carrera y datos de matrícula</h3>
          <div className="edugest-field">
            <label>Carrera</label>
            <select className="edugest-select" value={careerId} onChange={(e) => setCareerId(e.target.value)}>
              <option value="">Seleccione...</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="edugest-field">
            <label>Periodo de ingreso (AAAA-N)</label>
            <input
              className="edugest-input"
              placeholder="2025-1"
              value={admissionPeriod}
              onChange={(e) => setAdmissionPeriod(e.target.value)}
            />
          </div>
          <div className="edugest-field">
            <label>Estado académico inicial</label>
            <select
              className="edugest-select"
              value={academicStatus}
              onChange={(e) => setAcademicStatus(e.target.value)}
            >
              {ACADEMIC_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
          <p className="edugest-info-note">
            El estado académico inicial define la situación del estudiante al momento de la matrícula.
          </p>
        </>
      );
    }

    return (
      <div className="edugest-card edugest-card-body">
        <p className="edugest-warning-note">Revise el resumen antes de confirmar la matrícula.</p>
        <div className="edugest-detail-row">
          <span className="edugest-detail-label">Estudiante</span>
          <span>{summaryRegistration.student}</span>
        </div>
        <div className="edugest-detail-row">
          <span className="edugest-detail-label">Carrera</span>
          <span>{summaryRegistration.career}</span>
        </div>
        <div className="edugest-detail-row">
          <span className="edugest-detail-label">Periodo</span>
          <span>{summaryRegistration.period}</span>
        </div>
        <div className="edugest-detail-row">
          <span className="edugest-detail-label">Estado académico</span>
          <span>{summaryRegistration.status}</span>
        </div>
      </div>
    );
  };

  const canNext =
    (step === 1 && selectedStudent) ||
    ((step === 2 || step === 3) && careerId && admissionPeriod && validateAdmissionPeriod(admissionPeriod));

  return (
    <div className="edugest-page">
      <PageHeader
        title="Matricular estudiante"
        breadcrumbs={[
          { label: 'Inicio', to: '/usuarios' },
          { label: 'Matrículas' },
          { label: 'Matricular' },
        ]}
      />

      <Stepper steps={STEPS} currentStep={step} />

      <div className="edugest-wizard-layout">
        <div className="edugest-card edugest-card-body">
          {renderStep()}
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
                  onClick={() => {
                    if (step === 3 && checkDuplicate()) return;
                    setStep((s) => Math.min(4, s + 1));
                  }}
                >
                  Siguiente
                </button>
              ) : (
                <button type="button" className="edugest-btn edugest-btn-primary" onClick={() => setConfirmOpen(true)}>
                  Confirmar matrícula
                </button>
              )}
            </div>
          )}
        </div>

        <div className="edugest-summary-panel">
          <h3>Información de la matrícula</h3>
          <div className="edugest-detail-row">
            <span className="edugest-detail-label">Estudiante</span>
            <span>{summaryRegistration.student}</span>
          </div>
          <div className="edugest-detail-row">
            <span className="edugest-detail-label">Carrera</span>
            <span>{summaryRegistration.career}</span>
          </div>
          <div className="edugest-detail-row">
            <span className="edugest-detail-label">Periodo</span>
            <span>{summaryRegistration.period}</span>
          </div>
          <div className="edugest-detail-row">
            <span className="edugest-detail-label">Estado</span>
            <span>{summaryRegistration.status}</span>
          </div>
          <p className="edugest-info-note">
            Estados disponibles: Activo, Retirado, Suspendido, Egresado.
          </p>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        title="Confirmar matrícula"
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setConfirmOpen(false)}>
              Atrás
            </button>
            <button type="button" className="edugest-btn edugest-btn-primary" onClick={submitRegistration}>
              Confirmar matrícula
            </button>
          </>
        }
      >
        <p className="edugest-warning-note">
          Esta acción registrará la matrícula del estudiante en la carrera seleccionada.
        </p>
        <p>
          <strong>{summaryRegistration.student}</strong> → {summaryRegistration.career}
        </p>
      </Modal>

      <Modal
        open={duplicateOpen}
        title="No se puede matricular"
        onClose={() => setDuplicateOpen(false)}
        footer={
          <button type="button" className="edugest-btn edugest-btn-primary" onClick={() => setDuplicateOpen(false)}>
            Entendido
          </button>
        }
      >
        <p className="edugest-warning-note">Matrícula duplicada encontrada.</p>
        {duplicateReg && (
          <div className="edugest-card edugest-card-body">
            <p>Periodo: {duplicateReg.admission_period}</p>
            <p>Estado: {duplicateReg.academic_status}</p>
            <p>Activa: {duplicateReg.is_active ? 'Sí' : 'No'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MatricularEstudiantePage;
