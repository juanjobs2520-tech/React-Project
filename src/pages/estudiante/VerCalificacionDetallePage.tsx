import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { evaluationsService } from '../../services/evaluationsService';
import { rubricsService } from '../../services/rubricsService';
import { groupsService } from '../../services/groupsService';
import { subjectsService } from '../../services/subjectsService';
import { teachersService } from '../../services/teachersService';
import { enrollmentsService } from '../../services/enrollmentsService';
import { Criterion, Grade, Scale } from '../../models/Evaluation';
import { computeCriterionScore, scalesForCriterion } from '../../utils/rubricHelpers';
import { fullName } from '../../utils/academicCatalog';
import { formatDate } from '../../utils/userHelpers';
import { getApiErrorMessage, showErrorToast } from '../../utils/toast';

const VerCalificacionDetallePage = () => {
  const { id: gradeId } = useParams<{ id: string }>();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [meta, setMeta] = useState({
    subject: '',
    group: '',
    evaluation: '',
    teacher: '',
    rubricTitle: '',
    rubricPublic: false,
    evaluationId: '',
  });

  const load = useCallback(async () => {
    if (!gradeId) return;
    try {
      const g = await evaluationsService.getGrade(gradeId);
      setGrade(g);
      const [allC, allS, rub, evaluations, groups, subjects, teachers, enr] = await Promise.all([
        rubricsService.listCriteria(),
        rubricsService.listScales(),
        rubricsService.getById(g.rubric_id),
        evaluationsService.list(),
        groupsService.list(),
        subjectsService.list(),
        teachersService.list(),
        enrollmentsService.list(),
      ]);
      const crit = allC.filter((c) => c.rubric_id === g.rubric_id);
      setCriteria(crit);
      setScales(allS);
      const enrollment = enr.find((e) => e.id === g.enrollment_id);
      const ev = evaluations.find((e) => e.rubric_id === g.rubric_id && e.group_id === enrollment?.group_id);
      const group = groups.find((gr) => gr.id === enrollment?.group_id);
      const teacher = teachers.find((t) => t.id === group?.teacher_id);
      setMeta({
        subject: subjects.find((s) => s.id === ev?.subject_id)?.name ?? '',
        group: group?.name ?? '',
        evaluation: ev?.name ?? '',
        teacher: teacher ? fullName(teacher.first_name, teacher.last_name) : '',
        rubricTitle: rub.title,
        rubricPublic: rub.is_public,
        evaluationId: ev?.id ?? '',
      });
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }, [gradeId]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    if (!grade?.details) return [];
    return criteria.map((c) => {
      const criterionScales = scalesForCriterion(scales, c.id);
      const detail = grade.details?.find((d) => criterionScales.some((s) => s.id === d.scale_id));
      const scale = scales.find((s) => s.id === detail?.scale_id);
      const obtained = scale ? computeCriterionScore(scale.value, c.weight) : 0;
      const maxPossible = criterionScales.length
        ? computeCriterionScore(Math.max(...criterionScales.map((s) => s.value)), c.weight)
        : 0;
      return { criterion: c, scale, obtained, maxPossible, comment: detail?.comment };
    });
  }, [criteria, scales, grade]);

  const totalObtained = grade?.final_score ?? 0;
  const totalPossible = 100;
  const percent = Math.round((totalObtained / totalPossible) * 10000) / 100;

  if (!grade) return <div className="edugest-empty">Cargando calificación...</div>;

  return (
    <div className="edugest-page">
      <PageHeader title="Detalle de calificación" breadcrumbs={[{ label: 'Mis calificaciones' }, { label: 'Detalle' }]} />

      <div className="edugest-card edugest-card-body">
        <h2>{meta.evaluation}</h2>
        <p className="edugest-grade-big">
          {totalObtained} / {totalPossible}
        </p>
        {grade.status === 'SENT' && <StatusBadge variant="success" label="Enviada" />}
      </div>

      {grade.status === 'SENT' && (
        <p className="edugest-info-note">
          Esta calificación ha sido enviada por tu docente y ya es oficial. Si tienes dudas, comunícate con tu docente.
        </p>
      )}

      <div className="edugest-wizard-layout">
        <div className="edugest-card edugest-card-body">
          <h3>Detalle por criterios</h3>
          <div className="edugest-table-wrap">
            <table className="edugest-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Criterio (Peso)</th>
                  <th>Nivel obtenido</th>
                  <th>Puntaje obtenido</th>
                  <th>Puntaje posible</th>
                  <th>Comentario docente</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.criterion.id}>
                    <td>{i + 1}</td>
                    <td>
                      {r.criterion.name} ({r.criterion.weight}%)
                      <br />
                      <small>{r.criterion.description}</small>
                    </td>
                    <td>
                      {r.scale ? (
                        <>
                          {r.scale.name} ({r.scale.value})
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{r.obtained.toFixed(2)}</td>
                    <td>{r.maxPossible.toFixed(2)}</td>
                    <td>{r.comment ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>
                    <strong>Total</strong>
                  </td>
                  <td>
                    <strong>{totalObtained}</strong>
                  </td>
                  <td>
                    <strong>{totalPossible}</strong>
                  </td>
                  <td>{percent}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="edugest-info-note">Puntaje = valor escala × peso / 100</p>
        </div>

        <div className="edugest-summary-panel">
          <h3>Información general</h3>
          <p>Asignatura: {meta.subject}</p>
          <p>Grupo: {meta.group}</p>
          <p>Evaluación: {meta.evaluation}</p>
          <p>Docente: {meta.teacher}</p>
          <p>Enviada: {formatDate(grade.updated_at)}</p>
          <h3>Rúbrica utilizada</h3>
          <p>{meta.rubricTitle}</p>
          {meta.rubricPublic && <StatusBadge variant="success" label="Pública" />}
          {meta.evaluationId && (
            <Link className="edugest-btn edugest-btn-secondary" to={`/mis-evaluaciones/${meta.evaluationId}/rubrica`}>
              Ver rúbrica completa
            </Link>
          )}
          {grade.observations && (
            <>
              <h3>Observaciones del docente</h3>
              <p>{grade.observations}</p>
            </>
          )}
          <button type="button" className="edugest-btn edugest-btn-primary">
            Descargar reporte de desempeño
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerCalificacionDetallePage;
