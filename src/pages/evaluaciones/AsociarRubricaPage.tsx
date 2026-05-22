import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Stepper from '../../components/common/Stepper';
import StatusBadge from '../../components/common/StatusBadge';
import { evaluationsService } from '../../services/evaluationsService';
import { rubricsService } from '../../services/rubricsService';
import { subjectsService } from '../../services/subjectsService';
import { groupsService } from '../../services/groupsService';
import { Criterion, Evaluation, Rubric } from '../../models/Evaluation';
import { Subject } from '../../models/Academic';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../utils/toast';

const STEPS = ['Evaluación', 'Seleccionar rúbrica', 'Confirmar'];

const AsociarRubricaPage = () => {
  const { id: evaluationId } = useParams<{ id: string }>();
  const [step, setStep] = useState(1);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    if (!evaluationId) return;
    try {
      const [ev, rubs, crit, subs, groups] = await Promise.all([
        evaluationsService.getById(evaluationId),
        rubricsService.list(),
        rubricsService.listCriteria(),
        subjectsService.list(),
        groupsService.list(),
      ]);
      setEvaluation(ev);
      setRubrics(rubs.filter((r) => r.is_public && !r.is_archived));
      setCriteria(crit);
      setSubjects(subs);
      if (ev.rubric_id) setSelectedRubricId(ev.rubric_id);
      if (ev.subject_id) setSubjectId(ev.subject_id);
      const group = groups.find((g) => g.id === ev.group_id);
      if (group?.subject_id) setSubjectId(group.subject_id);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }, [evaluationId]);

  useEffect(() => {
    load();
  }, [load]);

  const publishedRubrics = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rubrics.filter((r) => {
      if (q && !r.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rubrics, search]);

  const criteriaCount = (rubricId: string) => criteria.filter((c) => c.rubric_id === rubricId).length;

  const selectedRubric = rubrics.find((r) => r.id === selectedRubricId);
  const selectedSubject = subjects.find((s) => s.id === subjectId);

  const confirm = async () => {
    if (!evaluationId || !selectedRubricId) return;
    try {
      await evaluationsService.associateRubric(evaluationId, selectedRubricId);
      showSuccessToast('Rúbrica asociada correctamente');
      setSuccess(true);
      setStep(3);
      load();
    } catch (error) {
      const msg = getApiErrorMessage(error);
      if (msg.includes('grades already exist')) {
        showErrorToast('No se puede cambiar la rúbrica: hay notas registradas');
      } else if (msg.includes('public')) {
        showErrorToast('No hay rúbricas publicadas disponibles');
      } else {
        showErrorToast(msg);
      }
    }
  };

  if (!evaluation) return <div className="edugest-empty">Cargando evaluación...</div>;

  return (
    <div className="edugest-page">
      <PageHeader
        title="Asociar rúbrica a evaluación"
        breadcrumbs={[{ label: 'Inicio', to: '/usuarios' }, { label: 'Evaluaciones' }, { label: 'Asociar' }]}
      />

      <Stepper steps={STEPS} currentStep={step} />

      <div className="edugest-wizard-layout">
        <div className="edugest-card edugest-card-body">
          {step === 1 && (
            <>
              <p className="edugest-info-note">Evaluación seleccionada para asociar rúbrica.</p>
              <div className="edugest-card edugest-card-body">
                <h3>{evaluation.name}</h3>
                <p>{evaluation.description ?? '—'}</p>
                <p>Ponderación: {evaluation.weight}%</p>
                {evaluation.rubric_id ? (
                  <StatusBadge variant="success" label="Con rúbrica" />
                ) : (
                  <StatusBadge variant="warning" label="Sin rúbrica" />
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="edugest-info-note">Solo se muestran rúbricas con estado publicado (is_public = true).</p>
              {publishedRubrics.length === 0 ? (
                <p className="edugest-warning-note">
                  No hay rúbricas publicadas.{' '}
                  <Link to="/rubricas/crear">Ir a crear rúbrica</Link>
                </p>
              ) : (
                <>
                  <input className="edugest-input" placeholder="Buscar rúbrica" value={search} onChange={(e) => setSearch(e.target.value)} />
                  <div className="edugest-field">
                    <label>Asignatura asociada</label>
                    <select className="edugest-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} — {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="edugest-table-wrap">
                    <table className="edugest-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Rúbrica</th>
                          <th>Criterios</th>
                        </tr>
                      </thead>
                      <tbody>
                        {publishedRubrics.map((r) => (
                          <tr key={r.id}>
                            <td>
                              <input
                                type="radio"
                                name="rubric"
                                checked={selectedRubricId === r.id}
                                onChange={() => setSelectedRubricId(r.id)}
                              />
                            </td>
                            <td>
                              {r.title} <StatusBadge variant="success" label="Publicada" />
                              <br />
                              <small>{r.description}</small>
                            </td>
                            <td>{criteriaCount(r.id)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {step === 3 && (
            <>
              {success ? (
                <div className="edugest-success-screen">
                  <h2>Asociación completada</h2>
                  <p>
                    Rúbrica: {selectedRubric?.title} → Asignatura: {selectedSubject?.name}
                  </p>
                </div>
              ) : (
                <div className="edugest-card edugest-card-body">
                  <h3>Confirmar asociación</h3>
                  <p>Evaluación: {evaluation.name}</p>
                  <p>Rúbrica: {selectedRubric?.title}</p>
                  <p>Asignatura: {selectedSubject?.name}</p>
                  <p className="edugest-warning-note">Se actualizarán la rúbrica y la asignatura de la evaluación.</p>
                </div>
              )}
            </>
          )}

          {!success && (
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
                  disabled={step === 2 && !selectedRubricId}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Siguiente
                </button>
              ) : (
                <button type="button" className="edugest-btn edugest-btn-primary" onClick={confirm}>
                  Confirmar asociación
                </button>
              )}
            </div>
          )}
        </div>

        <div className="edugest-summary-panel">
          <h3>Resumen de la asociación</h3>
          <p>
            <strong>Evaluación:</strong> {evaluation.name}
          </p>
          <p>
            <strong>Asignatura actual:</strong> {subjects.find((s) => s.id === evaluation.subject_id)?.name ?? '—'}
          </p>
          <hr />
          <p>
            <strong>Nueva rúbrica:</strong> {selectedRubric?.title ?? '—'}
          </p>
          <p>
            <strong>Nueva asignatura:</strong> {selectedSubject?.name ?? '—'}
          </p>
          <p className="edugest-warning-note">Campos que se actualizarán: rubric_id, subject_id</p>
        </div>
      </div>
    </div>
  );
};

export default AsociarRubricaPage;
