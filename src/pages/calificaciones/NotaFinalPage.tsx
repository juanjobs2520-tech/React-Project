import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Stepper from '../../components/common/Stepper';
import StatusBadge from '../../components/common/StatusBadge';
import { evaluationsService } from '../../services/evaluationsService';
import { groupsService } from '../../services/groupsService';
import { subjectsService } from '../../services/subjectsService';
import { semestersService } from '../../services/semestersService';
import { enrollmentsService } from '../../services/enrollmentsService';
import { studentsService } from '../../services/studentsService';
import { teachersService } from '../../services/teachersService';
import { Evaluation, Grade } from '../../models/Evaluation';
import { AcademicGroup, Semester } from '../../models/Academic';
import { Enrollment, Student } from '../../models/Operations';
import { fullName } from '../../utils/academicCatalog';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../utils/toast';

const STEPS = ['Revisar consolidado', 'Confirmar registro', 'Generar reporte'];

interface StudentRow {
  enrollmentId: string;
  studentName: string;
  evalScores: Record<string, number>;
  finalScore: number;
  complete: boolean;
}

const NotaFinalPage = () => {
  const [step, setStep] = useState(1);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [groupId, setGroupId] = useState('');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [success, setSuccess] = useState(false);

  const loadMeta = useCallback(async () => {
    try {
      const [g, semesters] = await Promise.all([groupsService.list(), semestersService.list()]);
      setGroups(g);
      setSemester(semesters.find((s) => s.is_active) ?? null);
      setGroupId((prev) => prev || g[0]?.id || '');
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }, []);

  const loadGroupData = useCallback(async () => {
    if (!groupId) return;
    try {
      const [evs, grd, enr, studs, subjects, teachers, groupsList] = await Promise.all([
        evaluationsService.list(),
        evaluationsService.listGrades(),
        enrollmentsService.list(),
        studentsService.list(),
        subjectsService.list(),
        teachersService.list(),
        groupsService.list(),
      ]);
      const group = groupsList.find((g) => g.id === groupId);
      setEvaluations(evs.filter((e) => e.group_id === groupId));
      setGrades(grd);
      setEnrollments(enr.filter((e) => e.group_id === groupId && e.status === 'ACTIVE'));
      setStudents(studs);
      setSubjectName(subjects.find((s) => s.id === group?.subject_id)?.name ?? '');
      const teacher = teachers.find((t) => t.id === group?.teacher_id);
      setTeacherName(teacher ? fullName(teacher.first_name, teacher.last_name) : '—');
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }, [groupId]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  const displayRows: StudentRow[] = useMemo(() => {
    const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));
    return enrollments.map((enrollment) => {
      const student = studentMap[enrollment.student_id];
      const studentGrades = grades.filter((g) => g.enrollment_id === enrollment.id);
      const evalScores: Record<string, number> = {};
      let finalScore = 0;
      let complete = evaluations.length > 0;
      evaluations.forEach((ev) => {
        if (!ev.rubric_id) return;
        const g = studentGrades.find((x) => x.rubric_id === ev.rubric_id);
        if (!g || g.status !== 'SENT') complete = false;
        if (g) {
          evalScores[ev.id] = g.final_score;
          finalScore += g.final_score * (ev.weight / 100);
        } else {
          complete = false;
        }
      });
      if (evaluations.length === 0) complete = false;
      return {
        enrollmentId: enrollment.id,
        studentName: student ? fullName(student.first_name, student.last_name) : enrollment.student_id,
        evalScores,
        finalScore: Math.round(finalScore * 100) / 100,
        complete,
      };
    });
  }, [enrollments, grades, evaluations, students]);

  const avgFinal =
    displayRows.length > 0
      ? Math.round((displayRows.reduce((s, r) => s + r.finalScore, 0) / displayRows.length) * 100) / 100
      : 0;

  const maxFinal = displayRows.length ? Math.max(...displayRows.map((r) => r.finalScore)) : 0;
  const minFinal = displayRows.length ? Math.min(...displayRows.map((r) => r.finalScore)) : 0;

  const registerOfficial = async () => {
    if (!groupId) return;
    if (!semester?.is_active) {
      showErrorToast('Semestre inactivo');
      return;
    }
    if (displayRows.some((r) => !r.complete)) {
      showErrorToast('Notas incompletas detectadas');
      return;
    }
    try {
      await evaluationsService.registerFinalScores(groupId);
      showSuccessToast('Registro oficial completado');
      setSuccess(true);
      setStep(3);
      loadGroupData();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  const selectedGroup = groups.find((g) => g.id === groupId);

  return (
    <div className="edugest-page">
      <PageHeader title="Registrar nota final" breadcrumbs={[{ label: 'Calificaciones' }, { label: 'Nota final' }]} />

      <div className="edugest-field">
        <label>Grupo</label>
        <select className="edugest-select" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.group_code})
            </option>
          ))}
        </select>
      </div>

      {selectedGroup && (
        <div className="edugest-card edugest-card-body">
          <p>
            <strong>Grupo:</strong> {selectedGroup.name} · <strong>Asignatura:</strong> {subjectName}
          </p>
          <p>
            <strong>Docente:</strong> {teacherName} · <strong>Inscritos:</strong> {enrollments.length}
          </p>
          {semester?.is_active && <StatusBadge variant="success" label="Semestre activo" />}
        </div>
      )}

      {evaluations[0] && (
        <p className="edugest-warning-note">
          <Link to={`/evaluaciones/${evaluations[0].id}/asociar-rubrica`}>Ir a evaluaciones (CU-10) →</Link>
        </p>
      )}

      <Stepper steps={STEPS} currentStep={step} />

      <div className="edugest-wizard-layout">
        <div className="edugest-card edugest-card-body">
          {(step === 1 || step === 2) && (
            <div className="edugest-table-wrap">
              <table className="edugest-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    {evaluations.map((ev) => (
                      <th key={ev.id}>
                        {ev.name} ({ev.weight}%)
                      </th>
                    ))}
                    <th>Nota final (100%)</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((r) => (
                    <tr key={r.enrollmentId}>
                      <td>{r.studentName}</td>
                      {evaluations.map((ev) => (
                        <td key={ev.id}>{r.evalScores[ev.id]?.toFixed(2) ?? '—'}</td>
                      ))}
                      <td>
                        <strong>{r.finalScore}</strong>
                      </td>
                      <td>
                        {r.complete ? (
                          <StatusBadge variant="success" label="Completa" />
                        ) : (
                          <StatusBadge variant="warning" label="Parcial" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>
                      <strong>Promedio grupo</strong>
                    </td>
                    <td colSpan={evaluations.length} />
                    <td>
                      <strong>{avgFinal}</strong>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
              <p className="edugest-info-note">
                Nota final = suma de (nota evaluación × ponderación / 100)
              </p>
            </div>
          )}

          {step === 3 && success && (
            <div className="edugest-success-screen">
              <h2>Reporte generado</h2>
              <p>Notas bloqueadas. Solo el administrador puede desbloquear.</p>
              <button type="button" className="edugest-btn edugest-btn-secondary">
                Vista previa del reporte
              </button>
            </div>
          )}

          {step < 3 && (
            <div className="edugest-modal-footer">
              {step > 1 && (
                <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setStep((s) => s - 1)}>
                  Atrás
                </button>
              )}
              {step === 1 && (
                <button type="button" className="edugest-btn edugest-btn-primary" onClick={() => setStep(2)}>
                  Confirmar registro oficial
                </button>
              )}
              {step === 2 && (
                <button type="button" className="edugest-btn edugest-btn-primary" onClick={registerOfficial}>
                  Confirmar registro oficial
                </button>
              )}
            </div>
          )}
        </div>

        <div className="edugest-summary-panel">
          <h3>Resumen del consolidado</h3>
          <p>Completas: {displayRows.filter((r) => r.complete).length}</p>
          <p>Parciales: {displayRows.filter((r) => !r.complete).length}</p>
          <p>Promedio: {avgFinal}</p>
          <p>Nota más alta: {maxFinal}</p>
          <p>Nota más baja: {minFinal}</p>
          <p className="edugest-info-note">El registro oficial bloquea las notas del grupo.</p>
        </div>
      </div>
    </div>
  );
};

export default NotaFinalPage;
