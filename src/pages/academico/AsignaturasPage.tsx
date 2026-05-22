import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import DropdownMenu from '../../components/common/DropdownMenu';
import { subjectsService } from '../../services/subjectsService';
import { Subject } from '../../models/Academic';
import { filterByText, paginate } from '../../utils/pagination';
import { formatDate } from '../../utils/userHelpers';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../utils/toast';

const AsignaturasPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [creditsFilter, setCreditsFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Subject | null>(null);

  const [modal, setModal] = useState<'create' | 'edit' | 'archive' | null>(null);
  const [form, setForm] = useState({ code: '', name: '', description: '', credits: 3 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSubjects(await subjectsService.list());
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = filterByText(subjects, search, ['name', 'code', 'description']);
    if (statusFilter === 'active') list = list.filter((s) => s.is_active);
    if (statusFilter === 'archived') list = list.filter((s) => !s.is_active);
    if (creditsFilter) list = list.filter((s) => String(s.credits) === creditsFilter);
    return list;
  }, [subjects, search, statusFilter, creditsFilter]);

  const paged = useMemo(() => paginate(filtered, page, pageSize), [filtered, page, pageSize]);

  const openCreate = () => {
    setForm({ code: '', name: '', description: '', credits: 3 });
    setModal('create');
  };

  const openEdit = (s: Subject) => {
    setSelected(s);
    setForm({
      code: s.code,
      name: s.name,
      description: s.description ?? '',
      credits: s.credits,
    });
    setModal('edit');
  };

  const save = async () => {
    if (form.credits <= 0) {
      showErrorToast('Créditos inválidos');
      return;
    }
    try {
      if (modal === 'create') {
        await subjectsService.create({
          code: form.code,
          name: form.name,
          description: form.description,
          credits: form.credits,
          is_active: true,
        });
        showSuccessToast('Asignatura creada');
      } else if (selected?.id) {
        await subjectsService.update(selected.id, {
          name: form.name,
          description: form.description,
          credits: form.credits,
        });
        showSuccessToast('Asignatura actualizada');
      }
      setModal(null);
      load();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, 'Código duplicado'));
    }
  };

  const archive = async () => {
    if (!selected?.id) return;
    try {
      await subjectsService.update(selected.id, { is_active: false });
      showSuccessToast('Asignatura archivada');
      setModal(null);
      setSelected(null);
      load();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, 'No se puede archivar'));
    }
  };

  const creditOptions = useMemo(() => {
    const set = new Set(subjects.map((s) => s.credits));
    return Array.from(set).sort((a, b) => a - b);
  }, [subjects]);

  return (
    <div className="edugest-page">
      <PageHeader
        title="Asignaturas"
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Académico' }, { label: 'Asignaturas' }]}
        actions={
          <button type="button" className="edugest-btn edugest-btn-primary" onClick={openCreate}>
            + Nueva asignatura
          </button>
        }
      />

      <div className="edugest-filters">
        <div className="edugest-field">
          <label>Buscar</label>
          <input className="edugest-input" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="edugest-field">
          <label>Estado</label>
          <select className="edugest-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todas</option>
            <option value="active">Activa</option>
            <option value="archived">Archivada</option>
          </select>
        </div>
        <div className="edugest-field">
          <label>Créditos</label>
          <select className="edugest-select" value={creditsFilter} onChange={(e) => setCreditsFilter(e.target.value)}>
            <option value="">Todos</option>
            {creditOptions.map((c) => (
              <option key={c} value={String(c)}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="edugest-btn edugest-btn-secondary"
          onClick={() => {
            setSearch('');
            setStatusFilter('');
            setCreditsFilter('');
          }}
        >
          Limpiar filtros
        </button>
      </div>

      <div className="edugest-two-col">
        <div className="edugest-card">
          {loading ? (
            <div className="edugest-empty">Cargando...</div>
          ) : (
            <>
              <div className="edugest-table-wrap">
                <table className="edugest-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Créditos</th>
                      <th>Estado</th>
                      <th>Última actualización</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((s) => (
                      <tr
                        key={s.id}
                        className={selected?.id === s.id ? 'edugest-table-row-selected' : ''}
                        onClick={() => setSelected(s)}
                      >
                        <td>{s.code}</td>
                        <td>{s.name}</td>
                        <td>{(s.description ?? '').slice(0, 40)}</td>
                        <td>{s.credits}</td>
                        <td>
                          {s.is_active ? (
                            <StatusBadge variant="success" label="Activa" />
                          ) : (
                            <StatusBadge variant="danger" label="Archivada" />
                          )}
                        </td>
                        <td>{formatDate(s.updated_at)}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="edugest-actions-cell">
                            <button type="button" className="edugest-icon-btn" onClick={() => openEdit(s)}>
                              <FiEdit2 />
                            </button>
                            <DropdownMenu
                              items={[
                                { id: 'e', label: 'Editar', onClick: () => openEdit(s) },
                                {
                                  id: 'a',
                                  label: 'Archivar',
                                  danger: true,
                                  onClick: () => {
                                    setSelected(s);
                                    setModal('archive');
                                  },
                                },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={page}
                pageSize={pageSize}
                total={filtered.length}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>

        <div className="edugest-detail-panel">
          <div className="edugest-detail-panel-header">Detalles de la asignatura</div>
          <div className="edugest-detail-panel-body">
            {selected ? (
              <>
                <div className="edugest-detail-row">
                  <span className="edugest-detail-label">Código</span>
                  <span>{selected.code}</span>
                </div>
                <div className="edugest-detail-row">
                  <span className="edugest-detail-label">Nombre</span>
                  <span>{selected.name}</span>
                </div>
                <div className="edugest-detail-row">
                  <span className="edugest-detail-label">Descripción</span>
                  <span>{selected.description ?? '—'}</span>
                </div>
                <div className="edugest-detail-row">
                  <span className="edugest-detail-label">Créditos</span>
                  <span>{selected.credits}</span>
                </div>
                <div className="edugest-detail-row">
                  <span className="edugest-detail-label">Estado</span>
                  {selected.is_active ? (
                    <StatusBadge variant="success" label="Activa" />
                  ) : (
                    <StatusBadge variant="danger" label="Archivada" />
                  )}
                </div>
                <div className="edugest-detail-row">
                  <span className="edugest-detail-label">Creada el</span>
                  <span>{formatDate(selected.created_at)}</span>
                </div>
                <div className="edugest-detail-row">
                  <span className="edugest-detail-label">Última actualización</span>
                  <span>{formatDate(selected.updated_at)}</span>
                </div>
                <p className="edugest-info-note">Seleccione una fila para ver el detalle completo de la asignatura.</p>
              </>
            ) : (
              <p className="edugest-empty">Seleccione una asignatura de la tabla</p>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={modal === 'create' || modal === 'edit'}
        title={modal === 'create' ? 'Nueva asignatura' : 'Editar asignatura'}
        onClose={() => setModal(null)}
        footer={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button type="button" className="edugest-btn edugest-btn-primary" onClick={save}>
              Guardar
            </button>
          </>
        }
      >
        <div className="edugest-field">
          <label>Código</label>
          <input
            className="edugest-input"
            value={form.code}
            disabled={modal === 'edit'}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </div>
        <div className="edugest-field">
          <label>Nombre</label>
          <input className="edugest-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="edugest-field">
          <label>Descripción</label>
          <textarea
            className="edugest-textarea"
            maxLength={250}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <small>{form.description.length}/250</small>
        </div>
        <div className="edugest-field">
          <label>Créditos</label>
          <input
            type="number"
            min={1}
            className="edugest-input"
            value={form.credits}
            onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
          />
        </div>
      </Modal>

      <Modal
        open={modal === 'archive'}
        title="Archivar asignatura"
        onClose={() => setModal(null)}
        footer={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button type="button" className="edugest-btn edugest-btn-danger" onClick={archive}>
              Archivar
            </button>
          </>
        }
      >
        <p className="edugest-warning-note">Verificaciones antes de archivar:</p>
        <ul>
          <li>No tiene grupos activos</li>
          <li>No está en un plan vigente</li>
        </ul>
      </Modal>
    </div>
  );
};

export default AsignaturasPage;
