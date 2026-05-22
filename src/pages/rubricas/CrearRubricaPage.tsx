import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Stepper from '../../components/common/Stepper';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { rubricsService } from '../../services/rubricsService';
import { Criterion } from '../../models/Evaluation';
import { sumWeights } from '../../utils/rubricHelpers';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../utils/toast';

const STEPS = ['Información', 'Criterios', 'Revisión', 'Publicar'];

const CrearRubricaPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [rubricId, setRubricId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [criterionModal, setCriterionModal] = useState(false);
  const [cForm, setCForm] = useState({ name: '', description: '', weight: 10 });
  const [saving, setSaving] = useState(false);

  const totalWeight = sumWeights(criteria);
  const canPublish = criteria.length > 0 && totalWeight === 100;

  const ensureRubric = async () => {
    if (rubricId) return rubricId;
    if (!title.trim()) throw new Error('El título es obligatorio');
    const rubric = await rubricsService.create({
      title,
      description,
      is_public: false,
      is_archived: false,
    });
    setRubricId(rubric.id);
    return rubric.id;
  };

  const loadCriteria = async (rid: string) => {
    const all = await rubricsService.listCriteria();
    setCriteria(all.filter((c) => c.rubric_id === rid));
  };

  const addCriterion = async () => {
    try {
      const rid = await ensureRubric();
      await rubricsService.addCriterion({
        rubric_id: rid,
        name: cForm.name,
        description: cForm.description,
        weight: Number(cForm.weight),
      });
      await loadCriteria(rid);
      setCriterionModal(false);
      setCForm({ name: '', description: '', weight: 10 });
      showSuccessToast('Criterio agregado');
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  const removeCriterion = async (id: string) => {
    if (!rubricId) return;
    try {
      await rubricsService.deleteCriterion(id);
      await loadCriteria(rubricId);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      await ensureRubric();
      showSuccessToast('Rúbrica guardada como borrador');
      if (rubricId) navigate(`/rubricas/${rubricId}/escalas`);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!canPublish) {
      showErrorToast(
        'No se puede publicar: la rúbrica debe tener al menos un criterio y la suma de los pesos debe ser 100%.'
      );
      return;
    }
    try {
      const rid = await ensureRubric();
      await rubricsService.publish(rid);
      showSuccessToast('Rúbrica publicada');
      setStep(4);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  const summaryPanel = (
    <div className="edugest-summary-panel">
      <h3>Resumen de la rúbrica</h3>
      <div className="edugest-detail-row">
        <span className="edugest-detail-label">Título</span>
        <span>{title || '—'}</span>
      </div>
      <div className="edugest-detail-row">
        <span className="edugest-detail-label">Estado</span>
        <StatusBadge variant="warning" label="Borrador" />
      </div>
      <div className="edugest-detail-row">
        <span className="edugest-detail-label">Criterios</span>
        <span>{criteria.length}</span>
      </div>
      <div className="edugest-detail-row">
        <span className="edugest-detail-label">Suma de pesos</span>
        <span className={totalWeight === 100 ? 'edugest-weight-ok' : 'edugest-weight-bad'}>{totalWeight}%</span>
      </div>
      {canPublish ? (
        <p className="edugest-info-note">Listo para publicar</p>
      ) : (
        <p className="edugest-warning-note">Complete criterios y pesos al 100%</p>
      )}
      {rubricId && (
        <Link className="edugest-btn edugest-btn-secondary" to={`/rubricas/${rubricId}/escalas`}>
          Definir escalas (CU-09) →
        </Link>
      )}
    </div>
  );

  return (
    <div className="edugest-page">
      <PageHeader
        title="Crear rúbrica de evaluación"
        breadcrumbs={[{ label: 'Inicio', to: '/usuarios' }, { label: 'Rúbricas' }, { label: 'Crear' }]}
      />

      <Stepper steps={STEPS} currentStep={step} />

      <div className="edugest-wizard-layout">
        <div className="edugest-card edugest-card-body">
          {step === 1 && (
            <>
              <div className="edugest-field">
                <label>Título de la rúbrica *</label>
                <input className="edugest-input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="edugest-field">
                <label>Descripción</label>
                <textarea
                  className="edugest-textarea"
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <small>{description.length}/500</small>
              </div>
              <p className="edugest-info-note">La suma de los pesos de los criterios debe ser 100%.</p>
            </>
          )}

          {step === 2 && (
            <>
              <p className="edugest-info-note">Agregue criterios con sus pesos porcentuales.</p>
              <button type="button" className="edugest-btn edugest-btn-primary" onClick={() => setCriterionModal(true)}>
                + Agregar criterio
              </button>
              <div className="edugest-table-wrap">
                <table className="edugest-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Criterio</th>
                      <th>Descripción</th>
                      <th>Peso (%)</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteria.map((c, i) => (
                      <tr key={c.id}>
                        <td>{i + 1}</td>
                        <td>{c.name}</td>
                        <td>{c.description ?? '—'}</td>
                        <td>{c.weight}</td>
                        <td>
                          <button type="button" className="edugest-btn edugest-btn-danger" onClick={() => removeCriterion(c.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}>
                        <strong>Suma total de pesos</strong>
                      </td>
                      <td colSpan={2}>
                        <span className={totalWeight === 100 ? 'edugest-weight-ok' : 'edugest-weight-bad'}>
                          {totalWeight}%
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="edugest-card edugest-card-body">
              <h3>Revisión</h3>
              <p>
                <strong>{title}</strong>
              </p>
              <p>{description || 'Sin descripción'}</p>
              <p>Criterios: {criteria.length}</p>
              <p>Pesos: {totalWeight}%</p>
            </div>
          )}

          {step === 4 && (
            <div className="edugest-success-screen">
              <h2>Rúbrica publicada</h2>
              {rubricId && (
                <Link className="edugest-btn edugest-btn-primary" to={`/rubricas/${rubricId}/escalas`}>
                  Definir escalas →
                </Link>
              )}
            </div>
          )}

          {step < 4 && (
            <div className="edugest-modal-footer">
              {step > 1 && (
                <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setStep((s) => s - 1)}>
                  Atrás
                </button>
              )}
              <button type="button" className="edugest-btn edugest-btn-secondary" disabled={saving} onClick={saveDraft}>
                Guardar borrador
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  className="edugest-btn edugest-btn-primary"
                  onClick={async () => {
                    try {
                      if (step === 1) await ensureRubric();
                      if (step === 2 && rubricId) await loadCriteria(rubricId);
                      if (step === 1) {
                        const rid = await ensureRubric();
                        await loadCriteria(rid);
                      }
                      setStep((s) => s + 1);
                    } catch (error) {
                      showErrorToast(getApiErrorMessage(error));
                    }
                  }}
                >
                  Revisar y continuar →
                </button>
              ) : (
                <button type="button" className="edugest-btn edugest-btn-primary" onClick={publish}>
                  Publicar rúbrica
                </button>
              )}
            </div>
          )}
        </div>
        {summaryPanel}
      </div>

      <Modal
        open={criterionModal}
        title="Agregar criterio"
        onClose={() => setCriterionModal(false)}
        footer={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setCriterionModal(false)}>
              Cancelar
            </button>
            <button type="button" className="edugest-btn edugest-btn-primary" onClick={addCriterion}>
              Agregar
            </button>
          </>
        }
      >
        <div className="edugest-field">
          <label>Nombre</label>
          <input className="edugest-input" value={cForm.name} onChange={(e) => setCForm({ ...cForm, name: e.target.value })} />
        </div>
        <div className="edugest-field">
          <label>Descripción</label>
          <textarea className="edugest-textarea" value={cForm.description} onChange={(e) => setCForm({ ...cForm, description: e.target.value })} />
        </div>
        <div className="edugest-field">
          <label>Peso (%)</label>
          <input
            type="number"
            className="edugest-input"
            value={cForm.weight}
            onChange={(e) => setCForm({ ...cForm, weight: Number(e.target.value) })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CrearRubricaPage;
