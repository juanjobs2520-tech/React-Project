import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import DropdownMenu from '../../components/common/DropdownMenu';
import { careersService } from '../../services/careersService';
import { semestersService } from '../../services/semestersService';
import { Career, Semester } from '../../models/Academic';
import { filterByText } from '../../utils/pagination';
import { formatDate } from '../../utils/userHelpers';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../utils/toast';

const CarrerasSemestresPage = () => {
  const [tab, setTab] = useState<'carreras' | 'semestres'>('carreras');
  const [careers, setCareers] = useState<Career[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [careerSearch, setCareerSearch] = useState('');
  const [semesterSearch, setSemesterSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [careerModal, setCareerModal] = useState<'create' | 'edit' | null>(null);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [archiveCareer, setArchiveCareer] = useState<Career | null>(null);

  const [semesterModal, setSemesterModal] = useState<'create' | 'edit' | null>(null);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  const [formCareer, setFormCareer] = useState({ code: '', name: '', description: '' });
  const [formSemester, setFormSemester] = useState({
    code: '',
    name: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([careersService.list(), semestersService.list()]);
      setCareers(c);
      setSemesters(s);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const semesterCountByCareer = useMemo(() => {
    const active = semesters.filter((s) => s.is_active).length;
    return { total: semesters.length, active };
  }, [semesters]);

  const filteredCareers = useMemo(
    () => filterByText(careers, careerSearch, ['name', 'code', 'description']),
    [careers, careerSearch]
  );

  const filteredSemesters = useMemo(
    () => filterByText(semesters, semesterSearch, ['name', 'code']),
    [semesters, semesterSearch]
  );

  const activeSemestersForCareer = () => semesters.filter((s) => s.is_active);

  const openCreateCareer = () => {
    setFormCareer({ code: '', name: '', description: '' });
    setEditingCareer(null);
    setCareerModal('create');
  };

  const openEditCareer = (career: Career) => {
    setEditingCareer(career);
    setFormCareer({
      code: career.code,
      name: career.name,
      description: career.description ?? '',
    });
    setCareerModal('edit');
  };

  const saveCareer = async () => {
    try {
      if (careerModal === 'create') {
        await careersService.create({
          code: formCareer.code,
          name: formCareer.name,
          description: formCareer.description,
          is_active: true,
        });
        showSuccessToast('Carrera creada exitosamente');
      } else if (editingCareer?.id) {
        await careersService.update(editingCareer.id, {
          name: formCareer.name,
          description: formCareer.description,
        });
        showSuccessToast('Carrera actualizada');
      }
      setCareerModal(null);
      load();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, 'Código duplicado'));
    }
  };

  const tryArchiveCareer = (career: Career) => {
    const hasActiveSemesters = activeSemestersForCareer().length > 0;
    setArchiveCareer(career);
    if (!hasActiveSemesters) {
      /* modal will show confirm */
    }
  };

  const confirmArchiveCareer = async () => {
    if (!archiveCareer?.id) return;
    try {
      await careersService.update(archiveCareer.id, { is_active: false });
      showSuccessToast('Carrera archivada');
      setArchiveCareer(null);
      load();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  const openCreateSemester = () => {
    setFormSemester({ code: '', name: '', start_date: '', end_date: '', is_active: true });
    setEditingSemester(null);
    setSemesterModal('create');
  };

  const openEditSemester = (semester: Semester) => {
    setEditingSemester(semester);
    setFormSemester({
      code: semester.code,
      name: semester.name,
      start_date: semester.start_date?.slice(0, 10) ?? '',
      end_date: semester.end_date?.slice(0, 10) ?? '',
      is_active: semester.is_active,
    });
    setSemesterModal('edit');
  };

  const saveSemester = async () => {
    try {
      const payload = {
        code: formSemester.code,
        name: formSemester.name,
        start_date: formSemester.start_date,
        end_date: formSemester.end_date,
        is_active: formSemester.is_active,
      };
      if (semesterModal === 'create') {
        await semestersService.create(payload);
        showSuccessToast('Semestre creado exitosamente');
      } else if (editingSemester?.id) {
        await semestersService.update(editingSemester.id, payload);
        showSuccessToast('Semestre actualizado');
      }
      setSemesterModal(null);
      load();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, 'Fecha inválida'));
    }
  };

  const cannotArchive = archiveCareer && activeSemestersForCareer().length > 0;

  return (
    <div className="edugest-page">
      <PageHeader
        title="Académico"
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Académico' }, { label: 'Carreras y semestres' }]}
        actions={
          <button type="button" className="edugest-btn edugest-btn-secondary">
            Historial de cambios
          </button>
        }
      />

      <div className="edugest-tabs">
        <button
          type="button"
          className={`edugest-tab ${tab === 'carreras' ? 'edugest-tab-active' : ''}`}
          onClick={() => setTab('carreras')}
        >
          Carreras
        </button>
        <button
          type="button"
          className={`edugest-tab ${tab === 'semestres' ? 'edugest-tab-active' : ''}`}
          onClick={() => setTab('semestres')}
        >
          Semestres
        </button>
      </div>

      {loading ? (
        <div className="edugest-empty">Cargando...</div>
      ) : (
        <div className="edugest-two-col">
          <div className="edugest-card">
            <div className="edugest-card-body">
              <div className="edugest-page-header">
                <h3 className="edugest-page-title">Carreras</h3>
                <button type="button" className="edugest-btn edugest-btn-primary" onClick={openCreateCareer}>
                  + Nueva carrera
                </button>
              </div>
              <input
                className="edugest-input"
                placeholder="Buscar carrera..."
                value={careerSearch}
                onChange={(e) => setCareerSearch(e.target.value)}
              />
              <div className="edugest-table-wrap">
                <table className="edugest-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Semestres</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCareers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.code}</td>
                        <td>{c.name}</td>
                        <td>{c.description ?? '—'}</td>
                        <td>{semesterCountByCareer.active}</td>
                        <td>
                          {c.is_active ? (
                            <StatusBadge variant="success" label="Activo" />
                          ) : (
                            <StatusBadge variant="danger" label="Archivado" />
                          )}
                        </td>
                        <td>
                          <div className="edugest-actions-cell">
                            <button type="button" className="edugest-icon-btn" onClick={() => openEditCareer(c)}>
                              <FiEdit2 />
                            </button>
                            <DropdownMenu
                              items={[
                                { id: 'e', label: 'Editar carrera', onClick: () => openEditCareer(c) },
                                { id: 'a', label: 'Archivar carrera', onClick: () => tryArchiveCareer(c), danger: true },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="edugest-card">
            <div className="edugest-card-body">
              <div className="edugest-page-header">
                <h3 className="edugest-page-title">Semestres</h3>
                <button type="button" className="edugest-btn edugest-btn-primary" onClick={openCreateSemester}>
                  + Nuevo semestre
                </button>
              </div>
              <input
                className="edugest-input"
                placeholder="Buscar semestre..."
                value={semesterSearch}
                onChange={(e) => setSemesterSearch(e.target.value)}
              />
              <div className="edugest-table-wrap">
                <table className="edugest-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Carrera</th>
                      <th>Inicio</th>
                      <th>Fin</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSemesters.map((s) => (
                      <tr key={s.id}>
                        <td>{s.code}</td>
                        <td>{s.name}</td>
                        <td>—</td>
                        <td>{formatDate(s.start_date)}</td>
                        <td>{formatDate(s.end_date)}</td>
                        <td>
                          {s.is_active ? (
                            <StatusBadge variant="success" label="Activo" />
                          ) : (
                            <StatusBadge variant="danger" label="Inactivo" />
                          )}
                        </td>
                        <td>
                          <button type="button" className="edugest-icon-btn" onClick={() => openEditSemester(s)}>
                            <FiEdit2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={!!careerModal}
        title={careerModal === 'create' ? 'Nueva carrera' : 'Editar carrera'}
        onClose={() => setCareerModal(null)}
        footer={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setCareerModal(null)}>
              Cancelar
            </button>
            <button type="button" className="edugest-btn edugest-btn-primary" onClick={saveCareer}>
              {careerModal === 'create' ? 'Guardar carrera' : 'Guardar cambios'}
            </button>
          </>
        }
      >
        <div className="edugest-field">
          <label>Código</label>
          <input
            className="edugest-input"
            value={formCareer.code}
            disabled={careerModal === 'edit'}
            onChange={(e) => setFormCareer({ ...formCareer, code: e.target.value })}
          />
          {careerModal === 'edit' && (
            <small className="edugest-warning-note">El código no puede ser modificado.</small>
          )}
        </div>
        <div className="edugest-field">
          <label>Nombre</label>
          <input
            className="edugest-input"
            value={formCareer.name}
            onChange={(e) => setFormCareer({ ...formCareer, name: e.target.value })}
          />
        </div>
        <div className="edugest-field">
          <label>Descripción</label>
          <textarea
            className="edugest-textarea"
            maxLength={250}
            value={formCareer.description}
            onChange={(e) => setFormCareer({ ...formCareer, description: e.target.value })}
          />
          <small>{formCareer.description.length}/250</small>
        </div>
      </Modal>

      <Modal
        open={!!semesterModal}
        title={semesterModal === 'create' ? 'Nuevo semestre' : 'Editar semestre'}
        onClose={() => setSemesterModal(null)}
        footer={
          <>
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setSemesterModal(null)}>
              Cancelar
            </button>
            <button type="button" className="edugest-btn edugest-btn-primary" onClick={saveSemester}>
              Guardar semestre
            </button>
          </>
        }
      >
        {semesterModal === 'create' && (
          <p className="edugest-info-note">
            Al activar un nuevo semestre, el semestre activo actual se desactivará automáticamente.
          </p>
        )}
        <div className="edugest-field">
          <label>Código</label>
          <input
            className="edugest-input"
            value={formSemester.code}
            onChange={(e) => setFormSemester({ ...formSemester, code: e.target.value })}
          />
        </div>
        <div className="edugest-field">
          <label>Nombre</label>
          <input
            className="edugest-input"
            value={formSemester.name}
            onChange={(e) => setFormSemester({ ...formSemester, name: e.target.value })}
          />
        </div>
        <div className="edugest-field">
          <label>Fecha inicio</label>
          <input
            type="date"
            className="edugest-input"
            value={formSemester.start_date}
            onChange={(e) => setFormSemester({ ...formSemester, start_date: e.target.value })}
          />
        </div>
        <div className="edugest-field">
          <label>Fecha fin</label>
          <input
            type="date"
            className="edugest-input"
            value={formSemester.end_date}
            onChange={(e) => setFormSemester({ ...formSemester, end_date: e.target.value })}
          />
        </div>
        <div className="edugest-field">
          <label>Estado</label>
          <select
            className="edugest-select"
            value={formSemester.is_active ? '1' : '0'}
            onChange={(e) => setFormSemester({ ...formSemester, is_active: e.target.value === '1' })}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </div>
      </Modal>

      <Modal
        open={!!archiveCareer}
        title="Archivar carrera"
        onClose={() => setArchiveCareer(null)}
        footer={
          cannotArchive ? (
            <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setArchiveCareer(null)}>
              Cerrar
            </button>
          ) : (
            <>
              <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setArchiveCareer(null)}>
                Cancelar
              </button>
              <button type="button" className="edugest-btn edugest-btn-danger" onClick={confirmArchiveCareer}>
                Archivar
              </button>
            </>
          )
        }
      >
        {archiveCareer && (
          <>
            {cannotArchive ? (
              <p className="edugest-warning-note">
                ¿Estás seguro que deseas archivar esta carrera? No se puede archivar porque tiene semestres activos
                asociados.
              </p>
            ) : (
              <p>¿Confirmas archivar la carrera {archiveCareer.name}?</p>
            )}
            <div className="edugest-card">
              <div className="edugest-card-body">
                <strong>{archiveCareer.name}</strong> ({archiveCareer.code})
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CarrerasSemestresPage;
