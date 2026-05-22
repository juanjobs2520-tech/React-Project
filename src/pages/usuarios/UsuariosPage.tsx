import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiEye } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import DropdownMenu from '../../components/common/DropdownMenu';
import CreateUserModal from '../../components/usuarios/CreateUserModal';
import EditUserModal from '../../components/usuarios/EditUserModal';
import DeactivateUserModal from '../../components/usuarios/DeactivateUserModal';
import { userService } from '../../services/userService';
import { careersService } from '../../services/careersService';
import { registrationsService } from '../../services/registrationsService';
import { CreateUserPayload, StudentProfile, User } from '../../models/User';
import { Career } from '../../models/Academic';
import { paginate } from '../../utils/pagination';
import { formatDate, getUserFullName } from '../../utils/userHelpers';
import { getApiErrorMessage, showErrorToast, showSuccessToast } from '../../utils/toast';
import Modal from '../../components/common/Modal';

const UsuariosPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [careerFilter, setCareerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, careersData, registrations] = await Promise.all([
        userService.getUsers(),
        careersService.list(),
        registrationsService.list(),
      ]);

      const careerMap = Object.fromEntries(careersData.map((c) => [c.id, c.name]));
      const studentCareer: Record<string, string> = {};
      registrations
        .filter((r) => r.is_active)
        .forEach((r) => {
          studentCareer[r.student_id] = careerMap[r.career_id] ?? '—';
        });

      setUsers(
        usersData.map((u) => ({
          ...u,
          career_name:
            u.role === 'STUDENT'
              ? studentCareer[(u.profile as StudentProfile)?.id ?? ''] ?? '—'
              : '—',
        }))
      );
      setCareers(careersData);
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, 'No se pudieron cargar los usuarios'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (q) {
        const name = getUserFullName(u).toLowerCase();
        const match =
          name.includes(q) ||
          (u.email ?? '').toLowerCase().includes(q) ||
          (u.code ?? '').toLowerCase().includes(q);
        if (!match) return false;
      }
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && u.is_active === false) return false;
      if (statusFilter === 'inactive' && u.is_active !== false) return false;
      if (careerFilter && u.career_name !== careerFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter, careerFilter]);

  const paged = useMemo(() => paginate(filtered, page, pageSize), [filtered, page, pageSize]);

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setCareerFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const handleCreate = async (payload: CreateUserPayload) => {
    try {
      await userService.createUser(payload);
      showSuccessToast('Usuario creado exitosamente');
      loadData();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
      throw error;
    }
  };

  const handleUpdate = async (id: string, payload: Partial<User>) => {
    try {
      await userService.updateUser(id, payload);
      showSuccessToast('Usuario actualizado correctamente');
      loadData();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
      throw error;
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateUser?.id) return;
    try {
      await userService.deactivateUser(deactivateUser.id);
      showSuccessToast('Usuario desactivado');
      setDeactivateUser(null);
      loadData();
    } catch (error) {
      showErrorToast(getApiErrorMessage(error));
    }
  };

  const roleBadge = (role?: string) => {
    if (role === 'TEACHER') return <StatusBadge variant="success" label="Docente" />;
    if (role === 'STUDENT') return <StatusBadge variant="info" label="Estudiante" />;
    if (role === 'ADMIN') return <StatusBadge variant="neutral" label="Admin" />;
    return <StatusBadge variant="neutral" label={role ?? '—'} />;
  };

  return (
    <div className="edugest-page">
      <PageHeader
        title="Gestión de usuarios"
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Usuarios' },
        ]}
        actions={
          <button type="button" className="edugest-btn edugest-btn-primary" onClick={() => setCreateOpen(true)}>
            + Nuevo usuario
          </button>
        }
      />

      <div className="edugest-filters">
        <div className="edugest-field">
          <label>Buscar</label>
          <input
            className="edugest-input"
            placeholder="Nombre, email o código"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="edugest-field">
          <label>Rol</label>
          <select
            className="edugest-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            <option value="TEACHER">Docente</option>
            <option value="STUDENT">Estudiante</option>
          </select>
        </div>
        <div className="edugest-field">
          <label>Carrera</label>
          <select
            className="edugest-select"
            value={careerFilter}
            onChange={(e) => {
              setCareerFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            {careers.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="edugest-field">
          <label>Estado</label>
          <select
            className="edugest-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
        <button type="button" className="edugest-btn edugest-btn-secondary" onClick={clearFilters}>
          Limpiar filtros
        </button>
      </div>

      <div className="edugest-card">
        {loading ? (
          <div className="edugest-empty">Cargando usuarios...</div>
        ) : (
          <>
            <div className="edugest-table-wrap">
              <table className="edugest-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Carrera</th>
                    <th>Estado</th>
                    <th>Fecha de creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="edugest-empty">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  ) : (
                    paged.map((user) => (
                      <tr key={user.id}>
                        <td>{user.code}</td>
                        <td>{getUserFullName(user)}</td>
                        <td>{user.email}</td>
                        <td>{roleBadge(user.role)}</td>
                        <td>{user.role === 'STUDENT' ? user.career_name ?? '—' : '—'}</td>
                        <td>
                          {user.is_active !== false ? (
                            <StatusBadge variant="success" label="Activo" />
                          ) : (
                            <StatusBadge variant="danger" label="Inactivo" />
                          )}
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                          <div className="edugest-actions-cell">
                            <button
                              type="button"
                              className="edugest-icon-btn"
                              aria-label="Editar"
                              onClick={() => setEditUser(user)}
                            >
                              <FiEdit2 />
                            </button>
                            <DropdownMenu
                              items={[
                                {
                                  id: 'edit',
                                  label: 'Editar usuario',
                                  onClick: () => setEditUser(user),
                                },
                                {
                                  id: 'deactivate',
                                  label: 'Desactivar usuario',
                                  danger: true,
                                  onClick: () => setDeactivateUser(user),
                                },
                                {
                                  id: 'detail',
                                  label: 'Ver detalle',
                                  onClick: () => setDetailUser(user),
                                },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filtered.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} />
      <EditUserModal
        open={!!editUser}
        user={editUser}
        onClose={() => setEditUser(null)}
        onSave={handleUpdate}
      />
      <DeactivateUserModal
        open={!!deactivateUser}
        user={deactivateUser}
        onClose={() => setDeactivateUser(null)}
        onConfirm={handleDeactivate}
      />

      <Modal
        open={!!detailUser}
        title="Detalle del usuario"
        onClose={() => setDetailUser(null)}
        footer={
          <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setDetailUser(null)}>
            Cerrar
          </button>
        }
      >
        {detailUser && (
          <div className="edugest-detail-panel-body">
            <div className="edugest-detail-row">
              <span className="edugest-detail-label">Nombre</span>
              <span>{getUserFullName(detailUser)}</span>
            </div>
            <div className="edugest-detail-row">
              <span className="edugest-detail-label">Email</span>
              <span>{detailUser.email}</span>
            </div>
            <div className="edugest-detail-row">
              <span className="edugest-detail-label">Código</span>
              <span>{detailUser.code}</span>
            </div>
            <div className="edugest-detail-row">
              <span className="edugest-detail-label">Rol</span>
              <span>{detailUser.role}</span>
            </div>
            <div className="edugest-detail-row">
              <span className="edugest-detail-label">Estado</span>
              <span>{detailUser.is_active !== false ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsuariosPage;
