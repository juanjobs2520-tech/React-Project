import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { careersService } from '../../services/careersService';
import { subjectsService } from '../../services/subjectsService';
import { studyPlansService } from '../../services/studyPlansService';
import { Career, StudyPlan, Subject } from '../../models/Academic';
import { filterByText, paginate } from '../../utils/pagination';
import { formatDate } from '../../utils/userHelpers';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../utils/toast';

const PlanEstudiosPage = () => {
  const [careers, setCareers] = useState<Career[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [planSubjects, setPlanSubjects] = useState<Subject[]>([]);

  const [careerId, setCareerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [tab, setTab] = useState<'estructura' | 'borradores'>('estructura');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogPage, setCatalogPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [publishOpen, setPublishOpen] = useState(false);
  const [publishYear, setPublishYear] = useState(new Date().getFullYear());
  const [removeSubject, setRemoveSubject] = useState<Subject | null>(null);

  const loadBase = useCallback(async () => {
    setLoading(true);
    try {
      const [c, p, s] = await Promise.all([
        careersService.list(),
        studyPlansService.list(),
        subjectsService.list(),
      ]);
      setCareers(c.filter((x) => x.is_active));
      setPlans(p);
      setAllSubjects(s.filter((x) => x.is_active));
      setCareerId((prev) => prev || c[0]?.id || '');
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  const careerPlans = useMemo(
    () => plans.filter((p) => p.career_id === careerId),
    [plans, careerId]
  );

  const publishedPlans = useMemo(() => careerPlans.filter((p) => p.is_published), [careerPlans]);
  const draftPlans = useMemo(() => careerPlans.filter((p) => !p.is_published), [careerPlans]);

  const activePlan = useMemo(() => {
    const list = tab === 'estructura' ? publishedPlans : draftPlans;
    if (planId) return list.find((p) => p.id === planId) ?? list[0];
    return list[0];
  }, [tab, planId, publishedPlans, draftPlans]);

  useEffect(() => {
    if (activePlan?.id) setPlanId(activePlan.id);
  }, [activePlan?.id, tab, careerId]);

  const loadPlanSubjects = useCallback(async () => {
    if (!activePlan?.id) {
      setPlanSubjects([]);
      return;
    }
    try {
      setPlanSubjects(await studyPlansService.listSubjects(activePlan.id));
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  }, [activePlan?.id]);

  useEffect(() => {
    loadPlanSubjects();
  }, [loadPlanSubjects]);

  const catalogFiltered = useMemo(
    () => filterByText(allSubjects, catalogSearch, ['name', 'code']),
    [allSubjects, catalogSearch]
  );

  const catalogPaged = useMemo(
    () => paginate(catalogFiltered, catalogPage, 8),
    [catalogFiltered, catalogPage]
  );

  const planSubjectIds = useMemo(() => new Set(planSubjects.map((s) => s.id)), [planSubjects]);

  const totalCredits = useMemo(
    () => planSubjects.reduce((sum, s) => sum + (s.credits ?? 0), 0),
    [planSubjects]
  );

  const addToPlan = async (subject: Subject) => {
    if (!activePlan?.id) {
      showErrorToast('Seleccione o cree una versión del plan');
      return;
    }
    if (planSubjectIds.has(subject.id)) return;
    try {
      await studyPlansService.addSubject(activePlan.id, subject.id);
      showSuccessToast('Asignatura agregada al plan');
      loadPlanSubjects();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  const removeFromPlan = async () => {
    if (!activePlan?.id || !removeSubject?.id) return;
    try {
      await studyPlansService.removeSubject(activePlan.id, removeSubject.id);
      showSuccessToast('Asignatura eliminada del plan');
      setRemoveSubject(null);
      loadPlanSubjects();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, 'No se puede eliminar'));
    }
  };

  const createDraftVersion = async () => {
    if (!careerId) return;
    try {
      const year = new Date().getFullYear();
      const created = await studyPlansService.create({
        career_id: careerId,
        name: `Plan ${year} (borrador)`,
        year,
        suggested_semester: 1,
        is_published: false,
      });
      setPlans((prev) => [...prev, created]);
      setTab('borradores');
      setPlanId(created.id);
      showSuccessToast('Nueva versión creada');
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  const publishVersion = async () => {
    if (!activePlan?.id) return;
    try {
      await studyPlansService.update(activePlan.id, {
        is_published: true,
        year: publishYear,
      });
      showSuccessToast('Versión publicada');
      setPublishOpen(false);
      loadBase();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, 'No se puede publicar el plan'));
    }
  };

  const selectedCareer = careers.find((c) => c.id === careerId);

  return (
    <div className="edugest-page">
      <PageHeader
        title="Plan de estudios"
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Académico' }, { label: 'Plan de estudios' }]}
        actions={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary">
              Historial de versiones
            </button>
            <button type="button" className="edugest-btn edugest-btn-primary" onClick={createDraftVersion}>
              + Nueva versión
            </button>
          </>
        }
      />

      <div className="edugest-filters">
        <div className="edugest-field">
          <label>Carrera</label>
          <select className="edugest-select" value={careerId} onChange={(e) => setCareerId(e.target.value)}>
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="edugest-field">
          <label>Versión activa</label>
          <select
            className="edugest-select"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          >
            {(tab === 'estructura' ? publishedPlans : draftPlans).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.year})
              </option>
            ))}
          </select>
          {activePlan?.is_published && <StatusBadge variant="success" label="Publicado" />}
        </div>
      </div>

      <div className="edugest-tabs">
        <button
          type="button"
          className={`edugest-tab ${tab === 'estructura' ? 'edugest-tab-active' : ''}`}
          onClick={() => setTab('estructura')}
        >
          Estructura del plan
        </button>
        <button
          type="button"
          className={`edugest-tab ${tab === 'borradores' ? 'edugest-tab-active' : ''}`}
          onClick={() => setTab('borradores')}
        >
          Borradores
        </button>
      </div>

      {loading ? (
        <div className="edugest-empty">Cargando plan de estudios...</div>
      ) : (
        <div className="edugest-three-col">
          <div className="edugest-card">
            <div className="edugest-card-body">
              <h3 className="edugest-page-title">Catálogo de asignaturas</h3>
              <input
                className="edugest-input"
                placeholder="Buscar..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
              <ul className="edugest-catalog-list">
                {catalogPaged.map((s) => (
                  <li key={s.id} className="edugest-catalog-item">
                    <div>
                      <strong>{s.name}</strong>
                      <span>
                        {s.code} · {s.credits} créditos
                      </span>
                    </div>
                    <button
                      type="button"
                      className="edugest-btn edugest-btn-primary"
                      disabled={planSubjectIds.has(s.id)}
                      onClick={() => addToPlan(s)}
                    >
                      +
                    </button>
                  </li>
                ))}
              </ul>
              <div className="edugest-pagination">
                <button
                  type="button"
                  className="edugest-btn edugest-btn-secondary"
                  disabled={catalogPage <= 1}
                  onClick={() => setCatalogPage((p) => p - 1)}
                >
                  Anterior
                </button>
                <span>
                  Pág. {catalogPage} / {Math.max(1, Math.ceil(catalogFiltered.length / 8))}
                </span>
                <button
                  type="button"
                  className="edugest-btn edugest-btn-secondary"
                  disabled={catalogPage >= Math.ceil(catalogFiltered.length / 8)}
                  onClick={() => setCatalogPage((p) => p + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>

          <div className="edugest-card">
            <div className="edugest-card-body">
              <div className="edugest-page-header">
                <h3 className="edugest-page-title">
                  Plan actual{' '}
                  {activePlan && (
                    <StatusBadge
                      variant={activePlan.is_published ? 'success' : 'warning'}
                      label={activePlan.is_published ? 'Publicado' : 'Borrador'}
                    />
                  )}
                </h3>
                <span>{planSubjects.length} asignaturas</span>
              </div>
              {planSubjects.length === 0 ? (
                <div className="edugest-empty edugest-drop-zone">
                  Arrastra asignaturas aquí para agregarlas al plan o usa el botón + en el catálogo
                </div>
              ) : (
                <div className="edugest-table-wrap">
                  <table className="edugest-table">
                    <thead>
                      <tr>
                        <th>Semestre</th>
                        <th>Código</th>
                        <th>Asignatura</th>
                        <th>Créditos</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planSubjects.map((s) => (
                        <tr key={s.id}>
                          <td>{activePlan?.suggested_semester ?? '—'}</td>
                          <td>{s.code}</td>
                          <td>{s.name}</td>
                          <td>{s.credits}</td>
                          <td>
                            <button
                              type="button"
                              className="edugest-btn edugest-btn-danger"
                              onClick={() => setRemoveSubject(s)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!activePlan?.is_published && activePlan && (
                <button
                  type="button"
                  className="edugest-btn edugest-btn-primary"
                  onClick={() => setPublishOpen(true)}
                >
                  Publicar versión
                </button>
              )}
            </div>
          </div>

          <div className="edugest-detail-panel">
            <div className="edugest-detail-panel-header">Detalles del plan</div>
            <div className="edugest-detail-panel-body">
              <div className="edugest-detail-row">
                <span className="edugest-detail-label">Carrera</span>
                <span>{selectedCareer?.name ?? '—'}</span>
              </div>
              <div className="edugest-detail-row">
                <span className="edugest-detail-label">Año (versión)</span>
                <span>{activePlan?.year ?? '—'}</span>
              </div>
              <div className="edugest-detail-row">
                <span className="edugest-detail-label">Estado</span>
                {activePlan?.is_published ? (
                  <StatusBadge variant="success" label="Publicado" />
                ) : (
                  <StatusBadge variant="warning" label="Borrador" />
                )}
              </div>
              <div className="edugest-detail-row">
                <span className="edugest-detail-label">Total asignaturas</span>
                <span>{planSubjects.length}</span>
              </div>
              <div className="edugest-detail-row">
                <span className="edugest-detail-label">Total créditos</span>
                <span>{totalCredits}</span>
              </div>
              <div className="edugest-detail-row">
                <span className="edugest-detail-label">Última actualización</span>
                <span>{formatDate(activePlan?.updated_at)}</span>
              </div>
              <h4>Historial de versiones</h4>
              {careerPlans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`edugest-card edugest-version-card ${p.id === activePlan?.id ? 'edugest-version-card-active' : ''}`}
                  onClick={() => {
                    setPlanId(p.id);
                    setTab(p.is_published ? 'estructura' : 'borradores');
                  }}
                >
                  <strong>
                    {p.year} — {p.is_published ? 'Publicado' : 'Borrador'}
                  </strong>
                  <span>{formatDate(p.updated_at)}</span>
                </button>
              ))}
              <button type="button" className="edugest-btn edugest-btn-secondary">
                Ver todas las versiones
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={publishOpen}
        title="Publicar nueva versión"
        onClose={() => setPublishOpen(false)}
        footer={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setPublishOpen(false)}>
              Cancelar
            </button>
            <button type="button" className="edugest-btn edugest-btn-primary" onClick={publishVersion}>
              Publicar
            </button>
          </>
        }
      >
        <p className="edugest-warning-note">
          Al publicar, esta versión reemplazará la versión publicada actual para la carrera seleccionada.
        </p>
        <div className="edugest-field">
          <label>Año</label>
          <input
            type="number"
            className="edugest-input"
            value={publishYear}
            onChange={(e) => setPublishYear(Number(e.target.value))}
          />
        </div>
      </Modal>

      <Modal
        open={!!removeSubject}
        title="Confirmar eliminación"
        onClose={() => setRemoveSubject(null)}
        footer={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setRemoveSubject(null)}>
              Cancelar
            </button>
            <button type="button" className="edugest-btn edugest-btn-danger" onClick={removeFromPlan}>
              Eliminar
            </button>
          </>
        }
      >
        <p>¿Eliminar {removeSubject?.name} del plan?</p>
      </Modal>
    </div>
  );
};

export default PlanEstudiosPage;
