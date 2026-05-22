import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { evaluationsService } from '../../services/evaluationsService';
import { rubricsService } from '../../services/rubricsService';
import { groupsService } from '../../services/groupsService';
import { subjectsService } from '../../services/subjectsService';
import { teachersService } from '../../services/teachersService';
import { Criterion, Evaluation, Rubric, Scale } from '../../models/Evaluation';
import { scaleLevelClass, scalesForCriterion, sumWeights } from '../../utils/rubricHelpers';
import { fullName } from '../../utils/academicCatalog';
import { getApiErrorMessage, showErrorToast } from '../../utils/toast';

const VerRubricaEstudiantePage = () => {
  const { id: evaluationId } = useParams<{ id: string }>();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [meta, setMeta] = useState({ subject: '', group: '', teacher: '' });

  const load = useCallback(async () => {
    if (!evaluationId) return;
    try {
      const ev = await evaluationsService.getById(evaluationId);
      setEvaluation(ev);
      if (!ev.rubric_id) return;
      const [rub, allC, allS, groups, subjects, teachers] = await Promise.all([
        rubricsService.getById(ev.rubric_id),
        rubricsService.listCriteria(),
        rubricsService.listScales(),
        groupsService.list(),
        subjectsService.list(),
        teachersService.list(),
      ]);
      setRubric(rub);
      setCriteria(allC.filter((c) => c.rubric_id === ev.rubric_id));
      setScales(allS);
      const group = groups.find((g) => g.id === ev.group_id);
      const teacher = teachers.find((t) => t.id === group?.teacher_id);
      setMeta({
        subject: subjects.find((s) => s.id === ev.subject_id)?.name ?? '',
        group: group?.name ?? '',
        teacher: teacher ? fullName(teacher.first_name, teacher.last_name) : '',
      });
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }, [evaluationId]);

  useEffect(() => {
    load();
  }, [load]);

  const maxScaleCols = Math.max(...criteria.map((c) => scalesForCriterion(scales, c.id).length), 1);

  if (!evaluation) return <div className="edugest-empty">Cargando...</div>;

  return (
    <div className="edugest-page">
      <PageHeader
        title="Rúbrica de evaluación"
        breadcrumbs={[
          { label: 'Inicio', to: '/usuarios' },
          { label: 'Mis evaluaciones', to: '/usuarios' },
          { label: evaluation.name },
          { label: 'Rúbrica' },
        ]}
      />

      <Link to="/usuarios" className="edugest-btn edugest-btn-secondary">
        ← Volver a mis evaluaciones
      </Link>

      <div className="edugest-card edugest-card-body">
        <h2>{evaluation.name}</h2>
        <p>Código: {evaluation.id.slice(0, 8)} · Ponderación: {evaluation.weight}%</p>
        <p>Asignatura: {meta.subject} · Grupo: {meta.group} · Docente: {meta.teacher}</p>
        {rubric?.is_public && <StatusBadge variant="success" label="Rúbrica asociada Publicada" />}
      </div>

      <div className="edugest-wizard-layout">
        <div className="edugest-card edugest-card-body">
          <div className="edugest-page-header">
            <h3>{rubric?.title}</h3>
            {rubric?.is_public && <StatusBadge variant="success" label="Pública" />}
            <button type="button" className="edugest-btn edugest-btn-secondary">
              Descargar rúbrica
            </button>
          </div>
          <p>{rubric?.description}</p>

          <div className="edugest-table-wrap">
            <table className="edugest-rubric-matrix">
              <thead>
                <tr>
                  <th>Criterio</th>
                  {Array.from({ length: maxScaleCols }).map((_, i) => (
                    <th key={i}>Nivel {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criteria.map((c) => {
                  const levels = scalesForCriterion(scales, c.id);
                  return (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.name}</strong> ({c.weight}%)
                        <br />
                        <small>{c.description}</small>
                      </td>
                      {Array.from({ length: maxScaleCols }).map((_, i) => {
                        const s = levels[i];
                        if (!s) return <td key={i}>—</td>;
                        return (
                          <td key={s.id} className={scaleLevelClass(i, levels.length)}>
                            <strong>
                              {s.name} ({s.value})
                            </strong>
                            <br />
                            {s.description}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="edugest-info-note">La suma de los pesos de los criterios es {sumWeights(criteria)}%.</p>
        </div>

        <div className="edugest-summary-panel">
          <h3>Información de la rúbrica</h3>
          <p>
            <strong>Título:</strong> {rubric?.title}
          </p>
          <p>
            <strong>Criterios:</strong> {criteria.length}
          </p>
          <p>
            <strong>Suma de pesos:</strong> {sumWeights(criteria)}%
          </p>
          <p>
            <strong>Evaluación:</strong> {evaluation.name}
          </p>
          <div className="edugest-info-note">
            <strong>¿Qué es esta rúbrica?</strong>
            <p>Describe los criterios y niveles con los que el docente evaluará tu desempeño.</p>
          </div>
          <div className="edugest-warning-note">
            <strong>Recordatorio:</strong> Consulta con tu docente si tienes dudas sobre los criterios.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerRubricaEstudiantePage;
