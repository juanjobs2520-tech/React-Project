import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Stepper from '../../components/common/Stepper';
import StatusBadge from '../../components/common/StatusBadge';
import { evaluationsService } from '../../services/evaluationsService';
import { rubricsService } from '../../services/rubricsService';
import { enrollmentsService } from '../../services/enrollmentsService';
import { studentsService } from '../../services/studentsService';
import { groupsService } from '../../services/groupsService';
import { subjectsService } from '../../services/subjectsService';
import { Criterion, Evaluation, Rubric, Scale } from '../../models/Evaluation';
import { Enrollment } from '../../models/Operations';
import { Student } from '../../models/Operations';
import { fullName } from '../../utils/academicCatalog';
import { computeCriterionScore, scalesForCriterion, sumWeights } from '../../utils/rubricHelpers';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../utils/toast';

const STEPS = ['Seleccionar estudiante', 'Evaluar criterios', 'Revisar y enviar'];

interface EnrollmentRow {
  enrollment: Enrollment;
  student: Student;
}

const CalificarEstudiantePage = () => {
  const { id: evaluationId } = useParams<{ id: string }>();
  const [step, setStep] = useState(1);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [groupName, setGroupName] = useState('');

  const [studentIndex, setStudentIndex] = useState(0);
  const [selectedScales, setSelectedScales] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!evaluationId) return;
    try {
      const ev = await evaluationsService.getById(evaluationId);
      setEvaluation(ev);
      if (!ev.rubric_id) {
        showErrorToast('La evaluación no tiene rúbrica asociada');
        return;
      }
      const [rub, allC, allS, enr, students, groups, subjects] = await Promise.all([
        rubricsService.getById(ev.rubric_id),
        rubricsService.listCriteria(),
        rubricsService.listScales(),
        enrollmentsService.list(),
        studentsService.list(),
        groupsService.list(),
        subjectsService.list(),
      ]);
      setRubric(rub);
      const crit = allC.filter((c) => c.rubric_id === ev.rubric_id);
      setCriteria(crit);
      setScales(allS);
      const group = groups.find((g) => g.id === ev.group_id);
      setGroupName(group?.name ?? '');
      setSubjectName(subjects.find((s) => s.id === ev.subject_id)?.name ?? '');
      const activeEnr = enr.filter((e) => e.group_id === ev.group_id && e.status === 'ACTIVE');
      const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));
      setRows(
        activeEnr
          .map((e) => ({ enrollment: e, student: studentMap[e.student_id] }))
          .filter((r) => r.student) as EnrollmentRow[]
      );
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }, [evaluationId]);

  useEffect(() => {
    load();
  }, [load]);

  const current = rows[studentIndex];

  const scoresByCriterion = useMemo(() => {
    const result: Record<string, number> = {};
    criteria.forEach((c) => {
      const scaleId = selectedScales[c.id];
      const scale = scales.find((s) => s.id === scaleId);
      if (scale) result[c.id] = computeCriterionScore(scale.value, c.weight);
    });
    return result;
  }, [criteria, selectedScales, scales]);

  const finalScore = useMemo(
    () => Math.round(Object.values(scoresByCriterion).reduce((a, b) => a + b, 0) * 100) / 100,
    [scoresByCriterion]
  );

  const gradedCount = criteria.filter((c) => selectedScales[c.id]).length;
  const allGraded = gradedCount === criteria.length;

  const submit = async (status: 'DRAFT' | 'SENT') => {
    if (!current || !evaluation?.rubric_id) return;
    if (status === 'SENT' && !allGraded) {
      showErrorToast(
        'No se puede enviar la calificación: Debes seleccionar un nivel de desempeño (escala) para todos los criterios.'
      );
      return;
    }
    try {
      await evaluationsService.gradeStudent({
        enrollment_id: current.enrollment.id,
        evaluation_id: evaluationId,
        details: criteria
          .filter((c) => selectedScales[c.id])
          .map((c) => ({
            scale_id: selectedScales[c.id],
            comment: comments[c.id],
          })),
        status,
        observations: status === 'SENT' ? 'Calificación enviada' : undefined,
      });
      showSuccessToast(status === 'SENT' ? 'Calificación enviada' : 'Borrador guardado');
      if (status === 'SENT' && studentIndex < rows.length - 1) {
        setStudentIndex((i) => i + 1);
        setSelectedScales({});
        setComments({});
        setStep(2);
      }
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  if (!evaluation) return <div className="edugest-empty">Cargando...</div>;

  return (
    <div className="edugest-page">
      <PageHeader title="Calificar estudiante con rúbrica" breadcrumbs={[{ label: 'Evaluaciones' }, { label: 'Calificar' }]} />

      <div className="edugest-banner-rubric">
        <span>
          Rúbrica asociada: <strong>{rubric?.title}</strong>
        </span>
        {rubric && (
          <Link className="edugest-btn edugest-btn-secondary" to={`/rubricas/${rubric.id}/escalas`}>
            Ver rúbrica
          </Link>
        )}
      </div>

      <p>
        {evaluation.name} · {subjectName} · {groupName} · Ponderación {evaluation.weight}%
      </p>

      <Stepper steps={STEPS} currentStep={step} />

      <div className="edugest-wizard-layout">
        <div className="edugest-card edugest-card-body">
          {step === 1 && (
            <>
              <div className="edugest-student-card">
                {current && (
                  <>
                    <div className="edugest-avatar">
                      {current.student.first_name[0]}
                      {current.student.last_name[0]}
                    </div>
                    <div>
                      <strong>{fullName(current.student.first_name, current.student.last_name)}</strong>
                      <p>Cédula: {current.student.identification}</p>
                      <p>
                        Estudiante {studentIndex + 1} de {rows.length}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="edugest-actions-cell">
                <button
                  type="button"
                  className="edugest-btn edugest-btn-secondary"
                  disabled={studentIndex <= 0}
                  onClick={() => setStudentIndex((i) => i - 1)}
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  className="edugest-btn edugest-btn-secondary"
                  disabled={studentIndex >= rows.length - 1}
                  onClick={() => setStudentIndex((i) => i + 1)}
                >
                  Siguiente →
                </button>
              </div>
            </>
          )}

          {step === 2 && current && (
            <>
              <p>
                Completo / Pendiente: {gradedCount} de {criteria.length}
              </p>
              <div className="edugest-table-wrap">
                <table className="edugest-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Criterio (Peso)</th>
                      <th>Nivel de desempeño</th>
                      <th>Puntaje</th>
                      <th>Comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteria.map((c, i) => (
                      <tr key={c.id}>
                        <td>{i + 1}</td>
                        <td>
                          {c.name} ({c.weight}%)
                        </td>
                        <td>
                          <select
                            className="edugest-select"
                            value={selectedScales[c.id] ?? ''}
                            onChange={(e) => setSelectedScales({ ...selectedScales, [c.id]: e.target.value })}
                          >
                            <option value="">Seleccione...</option>
                            {scalesForCriterion(scales, c.id).map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.value})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>{scoresByCriterion[c.id]?.toFixed(2) ?? '—'}</td>
                        <td>
                          <textarea
                            className="edugest-textarea"
                            value={comments[c.id] ?? ''}
                            onChange={(e) => setComments({ ...comments, [c.id]: e.target.value })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}>
                        <strong>Total (suma ponderada)</strong>
                      </td>
                      <td colSpan={2}>
                        <span className="edugest-grade-big">{finalScore}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="edugest-info-note">
                Puntaje = valor de escala × peso del criterio / 100
              </p>
            </>
          )}

          {step === 3 && (
            <div className="edugest-card edugest-card-body">
              <h3>Revisar calificación</h3>
              <p>Estudiante: {current && fullName(current.student.first_name, current.student.last_name)}</p>
              <p className="edugest-grade-big">Nota final: {finalScore}</p>
              <p>Ponderación evaluación: {evaluation.weight}%</p>
            </div>
          )}

          <div className="edugest-modal-footer">
            {step > 1 && (
              <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setStep((s) => s - 1)}>
                Atrás
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                className="edugest-btn edugest-btn-primary"
                disabled={!current}
                onClick={() => setStep((s) => s + 1)}
              >
                Siguiente
              </button>
            ) : (
              <>
                <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => submit('DRAFT')}>
                  Guardar borrador
                </button>
                <button type="button" className="edugest-btn edugest-btn-primary" onClick={() => submit('SENT')}>
                  Enviar calificación
                </button>
              </>
            )}
            {step === 2 && (
              <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => submit('DRAFT')}>
                Guardar borrador
              </button>
            )}
          </div>
        </div>

        <div className="edugest-summary-panel">
          <h3>Resumen de la calificación</h3>
          <p>Rúbrica: {rubric?.title}</p>
          <p>Evaluación: {evaluation.name}</p>
          <p>Estudiante: {current && fullName(current.student.first_name, current.student.last_name)}</p>
          <p className="edugest-grade-big">{finalScore}</p>
          <StatusBadge variant={allGraded ? 'success' : 'warning'} label={allGraded ? 'Completa' : 'Parcial'} />
          <table className="edugest-table">
            <thead>
              <tr>
                <th>Criterio</th>
                <th>Peso</th>
                <th>Puntaje</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.weight}%</td>
                  <td>{scoresByCriterion[c.id]?.toFixed(2) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="edugest-info-note">Suma pesos rúbrica: {sumWeights(criteria)}%</p>
        </div>
      </div>
    </div>
  );
};

export default CalificarEstudiantePage;
