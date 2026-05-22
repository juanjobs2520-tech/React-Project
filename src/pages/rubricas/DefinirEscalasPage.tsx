import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { rubricsService } from '../../services/rubricsService';
import { Criterion, Rubric, Scale } from '../../models/Evaluation';
import {
  criterionHasMinScales,
  scalesForCriterion,
  sumWeights,
} from '../../utils/rubricHelpers';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../utils/toast';

const DefinirEscalasPage = () => {
  const { id: rubricId } = useParams<{ id: string }>();
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [selectedCriterionId, setSelectedCriterionId] = useState('');
  const [scaleModal, setScaleModal] = useState(false);
  const [sForm, setSForm] = useState({ name: '', description: '', value: 4 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!rubricId) return;
    setLoading(true);
    try {
      const [r, allC, allS] = await Promise.all([
        rubricsService.getById(rubricId),
        rubricsService.listCriteria(),
        rubricsService.listScales(),
      ]);
      const crit = allC.filter((c) => c.rubric_id === rubricId);
      setRubric(r);
      setCriteria(crit);
      setScales(allS);
      if (!selectedCriterionId && crit.length) setSelectedCriterionId(crit[0].id);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [rubricId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedCriterion = criteria.find((c) => c.id === selectedCriterionId);
  const criterionScales = useMemo(
    () => (selectedCriterionId ? scalesForCriterion(scales, selectedCriterionId) : []),
    [scales, selectedCriterionId]
  );

  const criteriaWithScales = criteria.filter((c) => criterionHasMinScales(scales, c.id)).length;
  const progress = criteria.length ? Math.round((criteriaWithScales / criteria.length) * 100) : 0;

  const addScale = async () => {
    if (!selectedCriterionId) return;
    try {
      await rubricsService.addScale({
        criterion_id: selectedCriterionId,
        name: sForm.name,
        description: sForm.description,
        value: Number(sForm.value),
      });
      showSuccessToast('Nivel agregado');
      setScaleModal(false);
      setSForm({ name: '', description: '', value: 4 });
      load();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  const deleteScale = async (scaleId: string) => {
    try {
      await rubricsService.deleteScale(scaleId);
      load();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  const tryPublish = async () => {
    if (!rubricId) return;
    const bad = criteria.find((c) => !criterionHasMinScales(scales, c.id));
    if (bad) {
      showErrorToast(`No se puede publicar: el criterio '${bad.name}' tiene menos de 2 niveles de escala definidos.`);
      return;
    }
    try {
      await rubricsService.publish(rubricId);
      showSuccessToast('Rúbrica publicada');
      load();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  if (loading) return <div className="edugest-empty">Cargando rúbrica...</div>;

  return (
    <div className="edugest-page">
      <PageHeader
        title={rubric?.title ?? 'Definir escalas'}
        breadcrumbs={[
          { label: 'Inicio', to: '/usuarios' },
          { label: 'Rúbricas', to: '/rubricas/crear' },
          { label: 'Escalas' },
        ]}
      />

      <div className="edugest-card edugest-card-body edugest-banner-rubric">
        <div>
          <strong>{rubric?.title}</strong>
          <p>{criteria.length} criterios · Peso {sumWeights(criteria)}%</p>
        </div>
        {rubric?.is_public ? (
          <StatusBadge variant="success" label="Pública" />
        ) : (
          <StatusBadge variant="warning" label="Borrador" />
        )}
      </div>

      <p className="edugest-info-note">Seleccione un criterio de la lista para definir sus niveles de escala.</p>

      <div className="edugest-three-col">
        <div>
          <Link className="edugest-btn edugest-btn-secondary" to="/rubricas/crear">
            Vista general
          </Link>
          {criteria.map((c) => {
            const count = scales.filter((s) => s.criterion_id === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                className={`edugest-criterion-card ${selectedCriterionId === c.id ? 'edugest-criterion-card-selected' : ''}`}
                onClick={() => setSelectedCriterionId(c.id)}
              >
                <strong>{c.name}</strong>
                <span>{c.weight}%</span>
                {count >= 2 ? (
                  <StatusBadge variant="success" label={`${count} escalas`} />
                ) : (
                  <StatusBadge variant="danger" label={`${count} escalas`} />
                )}
              </button>
            );
          })}
        </div>

        <div className="edugest-card edugest-card-body">
          {selectedCriterion && (
            <>
              <div className="edugest-page-header">
                <h3>
                  Definir escalas para: {selectedCriterion.name}{' '}
                  <StatusBadge variant="info" label={`${selectedCriterion.weight}%`} />
                </h3>
                <button type="button" className="edugest-btn edugest-btn-primary" onClick={() => setScaleModal(true)}>
                  + Agregar nivel
                </button>
              </div>
              <div className="edugest-table-wrap">
                <table className="edugest-table">
                  <thead>
                    <tr>
                      <th>Nivel</th>
                      <th>Etiqueta</th>
                      <th>Descripción</th>
                      <th>Valor</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {criterionScales.map((s, i) => (
                      <tr key={s.id}>
                        <td>{i + 1}</td>
                        <td>{s.name}</td>
                        <td>{s.description ?? '—'}</td>
                        <td>{s.value}</td>
                        <td>
                          <button type="button" className="edugest-btn edugest-btn-danger" onClick={() => deleteScale(s.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="edugest-info-note">
                El valor debe ser único dentro del mismo criterio. Mínimo 2 niveles.
              </p>
              <p>
                Validación: {criterionScales.length} niveles definidos (mínimo: 2)
              </p>
            </>
          )}
        </div>

        <div className="edugest-summary-panel">
          <h3>Resumen</h3>
          <div className="edugest-detail-row">
            <span>Estado</span>
            {rubric?.is_public ? <StatusBadge variant="success" label="Pública" /> : <StatusBadge variant="warning" label="Borrador" />}
          </div>
          <div className="edugest-detail-row">
            <span>Criterios</span>
            <span>{criteria.length}</span>
          </div>
          <div className="edugest-detail-row">
            <span>Suma pesos</span>
            <span>{sumWeights(criteria)}%</span>
          </div>
          <p>Progreso: {criteriaWithScales} de {criteria.length} criterios con escalas</p>
          <div className="edugest-progress-bar">
            <div className="edugest-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="edugest-modal-footer">
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={load}>
              Guardar cambios
            </button>
            <button type="button" className="edugest-btn edugest-btn-primary" onClick={tryPublish}>
              Continuar a revisión →
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={scaleModal}
        title="Agregar nivel de escala"
        onClose={() => setScaleModal(false)}
        footer={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setScaleModal(false)}>
              Cancelar
            </button>
            <button type="button" className="edugest-btn edugest-btn-primary" onClick={addScale}>
              Guardar
            </button>
          </>
        }
      >
        <div className="edugest-field">
          <label>Etiqueta</label>
          <input className="edugest-input" value={sForm.name} onChange={(e) => setSForm({ ...sForm, name: e.target.value })} />
        </div>
        <div className="edugest-field">
          <label>Descripción</label>
          <textarea className="edugest-textarea" value={sForm.description} onChange={(e) => setSForm({ ...sForm, description: e.target.value })} />
        </div>
        <div className="edugest-field">
          <label>Valor numérico</label>
          <input type="number" className="edugest-input" value={sForm.value} onChange={(e) => setSForm({ ...sForm, value: Number(e.target.value) })} />
        </div>
      </Modal>
    </div>
  );
};

export default DefinirEscalasPage;
