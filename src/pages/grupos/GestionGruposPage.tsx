import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { semestersService } from '../../services/semestersService';
import { subjectsService } from '../../services/subjectsService';
import { groupsService } from '../../services/groupsService';
import { Semester, Subject } from '../../models/Academic';
import { AcademicGroup } from '../../models/Operations';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../utils/toast';

interface CreateGroupForm {
  name: string;
  group_code: string;
  capacity: string;
  semester_id: string;
  subject_id: string;
}

const EMPTY_FORM: CreateGroupForm = {
  name: '',
  group_code: '',
  capacity: '30',
  semester_id: '',
  subject_id: '',
};

const GestionGruposPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [form, setForm] = useState<CreateGroupForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState('');
  const [editingName, setEditingName] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupsData, semestersData, subjectsData] = await Promise.all([
        groupsService.list(),
        semestersService.list(),
        subjectsService.list(),
      ]);
      setGroups(groupsData);
      setSemesters(semestersData);
      setSubjects(subjectsData);

      const activeSemester = semestersData.find((semester) => semester.is_active);
      const defaultSemester = activeSemester?.id ?? semestersData[0]?.id ?? '';
      setSelectedSemester((current) => current || defaultSemester);
      setForm((current) => ({
        ...current,
        semester_id: current.semester_id || defaultSemester,
      }));
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const semesterMap = useMemo(
    () =>
      semesters.reduce<Record<string, Semester>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [semesters]
  );

  const subjectMap = useMemo(
    () =>
      subjects.reduce<Record<string, Subject>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [subjects]
  );

  const filteredGroups = useMemo(() => {
    let list = groups;
    if (selectedSemester) {
      list = list.filter((group) => group.semester_id === selectedSemester);
    }
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter((group) => {
      const subject = subjectMap[group.subject_id];
      return (
        group.name.toLowerCase().includes(query) ||
        group.group_code.toLowerCase().includes(query) ||
        (subject?.name ?? '').toLowerCase().includes(query) ||
        (subject?.code ?? '').toLowerCase().includes(query)
      );
    });
  }, [groups, search, selectedSemester, subjectMap]);

  const onCreateGroup = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.group_code || !form.semester_id || !form.subject_id) {
      showErrorToast('Completa todos los campos obligatorios para crear el grupo');
      return;
    }
    const parsedCapacity = Number(form.capacity);
    if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
      showErrorToast('La capacidad debe ser un numero mayor a 0');
      return;
    }

    setSubmitting(true);
    try {
      await groupsService.create({
        name: form.name.trim(),
        group_code: form.group_code.trim(),
        capacity: parsedCapacity,
        semester_id: form.semester_id,
        subject_id: form.subject_id,
      });
      showSuccessToast('Grupo creado correctamente');
      setForm((prev) => ({
        ...EMPTY_FORM,
        semester_id: prev.semester_id,
      }));
      await loadData();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const startRename = (group: AcademicGroup) => {
    setEditingId(group.id);
    setEditingName(group.name);
  };

  const cancelRename = () => {
    setEditingId('');
    setEditingName('');
  };

  const confirmRename = async (group: AcademicGroup) => {
    const nextName = editingName.trim();
    if (!nextName) {
      showErrorToast('El nombre del grupo no puede estar vacio');
      return;
    }
    if (nextName === group.name) {
      cancelRename();
      return;
    }
    try {
      await groupsService.update(group.id, { ...group, name: nextName });
      showSuccessToast('Grupo renombrado correctamente');
      cancelRename();
      await loadData();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  const deleteGroup = async (group: AcademicGroup) => {
    const shouldDelete = window.confirm(`Se eliminara el grupo "${group.name}" (${group.group_code}). Deseas continuar?`);
    if (!shouldDelete) return;
    try {
      await groupsService.remove(group.id);
      showSuccessToast('Grupo eliminado correctamente');
      await loadData();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  return (
    <div className="edugest-page">
      <PageHeader
        title="Gestionar grupos"
        breadcrumbs={[{ label: 'Inicio', to: '/usuarios' }, { label: 'Grupos' }, { label: 'Gestionar grupos' }]}
      />

      <div className="edugest-wizard-layout">
        <div className="edugest-card edugest-card-body">
          <h3 className="text-lg font-semibold mb-3">Crear grupo</h3>
          <form onSubmit={onCreateGroup}>
            <div className="edugest-filters">
              <div className="edugest-field">
                <label>Nombre del grupo *</label>
                <input
                  className="edugest-input"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ej: Sistemas 01 - Manana"
                />
              </div>
              <div className="edugest-field">
                <label>Codigo grupo *</label>
                <input
                  className="edugest-input"
                  value={form.group_code}
                  onChange={(event) => setForm((prev) => ({ ...prev, group_code: event.target.value }))}
                  placeholder="Ej: ING-SIS-01"
                />
              </div>
              <div className="edugest-field">
                <label>Capacidad *</label>
                <input
                  type="number"
                  min={1}
                  className="edugest-input"
                  value={form.capacity}
                  onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))}
                />
              </div>
              <div className="edugest-field">
                <label>Semestre *</label>
                <select
                  className="edugest-select"
                  value={form.semester_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, semester_id: event.target.value }))}
                >
                  <option value="">Seleccionar</option>
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.code} - {semester.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="edugest-field">
                <label>Asignatura *</label>
                <select
                  className="edugest-select"
                  value={form.subject_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, subject_id: event.target.value }))}
                >
                  <option value="">Seleccionar</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="edugest-modal-footer">
              <button type="submit" className="edugest-btn edugest-btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Crear grupo'}
              </button>
            </div>
          </form>
        </div>

        <div className="edugest-card edugest-card-body">
          <h3 className="text-lg font-semibold mb-3">Listado de grupos</h3>
          <div className="edugest-filters">
            <div className="edugest-field">
              <label>Filtrar por semestre</label>
              <select
                className="edugest-select"
                value={selectedSemester}
                onChange={(event) => setSelectedSemester(event.target.value)}
              >
                <option value="">Todos</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.code} - {semester.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="edugest-field">
              <label>Buscar</label>
              <input
                className="edugest-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nombre, codigo o asignatura"
              />
            </div>
          </div>

          {loading ? (
            <div className="edugest-empty">Cargando grupos...</div>
          ) : (
            <div className="edugest-table-wrap">
              <table className="edugest-table">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Nombre</th>
                    <th>Asignatura</th>
                    <th>Semestre</th>
                    <th>Cupos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.map((group) => {
                    const semester = semesterMap[group.semester_id];
                    const subject = subjectMap[group.subject_id];
                    const isEditing = editingId === group.id;
                    return (
                      <tr key={group.id}>
                        <td>{group.group_code}</td>
                        <td>
                          {isEditing ? (
                            <input
                              className="edugest-input"
                              value={editingName}
                              onChange={(event) => setEditingName(event.target.value)}
                            />
                          ) : (
                            group.name
                          )}
                        </td>
                        <td>{subject ? `${subject.code} - ${subject.name}` : 'Sin asignatura'}</td>
                        <td>
                          {semester ? (
                            <>
                              {semester.code}
                              {semester.is_active && <StatusBadge variant="success" label="Activo" />}
                            </>
                          ) : (
                            'Sin semestre'
                          )}
                        </td>
                        <td>{group.capacity}</td>
                        <td>
                          <div className="flex gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  className="edugest-btn edugest-btn-primary"
                                  onClick={() => confirmRename(group)}
                                >
                                  Guardar
                                </button>
                                <button type="button" className="edugest-btn edugest-btn-secondary" onClick={cancelRename}>
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => startRename(group)}>
                                  Renombrar
                                </button>
                                <button type="button" className="edugest-btn edugest-btn-danger" onClick={() => deleteGroup(group)}>
                                  Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredGroups.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6">
                        No hay grupos para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionGruposPage;
