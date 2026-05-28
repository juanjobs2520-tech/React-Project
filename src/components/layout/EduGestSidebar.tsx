import { NavLink, useLocation } from 'react-router-dom';
import {
  FiAward,
  FiBook,
  FiBookOpen,
  FiCheckSquare,
  FiClipboard,
  FiEdit3,
  FiGrid,
  FiLayers,
  FiList,
  FiPackage,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';
import { LocalStorageProvider } from '../../storage/LocalStorageProvider';

interface EduGestSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const storage = new LocalStorageProvider();

const getRole = (): string => {
  try {
    const raw = storage.getItem('user');
    if (!raw) return 'ADMIN';
    return JSON.parse(raw).role ?? 'ADMIN';
  } catch {
    return 'ADMIN';
  }
};

const EduGestSidebar = ({ sidebarOpen, setSidebarOpen }: EduGestSidebarProps) => {
  const { pathname } = useLocation();
  const role = getRole();
  const isStudent = role === 'STUDENT';
  const isTeacher = role === 'TEACHER' || role === 'ADMIN';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `edugest-sidebar-link ${isActive ? 'edugest-sidebar-link-active' : ''}`;

  return (
    <aside
      className={`edugest-sidebar absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="edugest-sidebar-header flex items-center justify-between gap-2 px-6 py-5.5">
        <NavLink to="/usuarios" className="edugest-sidebar-brand">
          EduGest
        </NavLink>
        <button
          type="button"
          className="edugest-sidebar-link lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        >
          ×
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-4 py-4 overflow-y-auto">
        {!isStudent && (
          <>
            <p className="edugest-sidebar-section">Administración</p>
            <NavLink to="/usuarios" className={linkClass}>
              <FiUsers /> Usuarios
            </NavLink>

            <p className="edugest-sidebar-section">Académico</p>
            <NavLink to="/academico/carreras" className={linkClass}>
              <FiGrid /> Carreras y semestres
            </NavLink>
            <NavLink to="/academico/asignaturas" className={linkClass}>
              <FiBook /> Asignaturas
            </NavLink>
            <NavLink to="/academico/plan-estudios" className={linkClass}>
              <FiLayers /> Plan de estudios
            </NavLink>

            <p className="edugest-sidebar-section">Operaciones</p>
            <NavLink to="/grupos/gestion" className={linkClass}>
              <FiPackage /> Gestionar grupos
            </NavLink>
            <NavLink to="/grupos/asignar-docente" className={linkClass}>
              <FiUserCheck /> Asignar docente
            </NavLink>
            <NavLink to="/matriculas/matricular" className={linkClass}>
              <FiClipboard /> Matricular estudiante
            </NavLink>
            <NavLink to="/inscripciones/inscribir" className={linkClass}>
              <FiUsers /> Inscribir en grupo
            </NavLink>
          </>
        )}

        {isTeacher && (
          <>
            <p className="edugest-sidebar-section">Evaluación</p>
            <NavLink to="/rubricas/crear" className={linkClass}>
              <FiEdit3 /> Crear rúbrica
            </NavLink>
            <NavLink to="/evaluaciones" className={linkClass}>
              <FiList /> Evaluaciones
            </NavLink>
            <NavLink to="/calificaciones/nota-final" className={linkClass}>
              <FiAward /> Nota final
            </NavLink>
          </>
        )}

        {(isStudent || role === 'ADMIN') && (
          <>
            <p className="edugest-sidebar-section">Estudiante</p>
            <NavLink to="/evaluaciones" className={linkClass}>
              <FiCheckSquare /> Mis evaluaciones
            </NavLink>
            <NavLink to="/mis-calificaciones" className={linkClass}>
              <FiBookOpen /> Mis calificaciones
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-auto px-4 py-4 text-xs text-bodydark2">
        {pathname.startsWith('/rubricas') || pathname.startsWith('/evaluaciones')
          ? 'Módulo evaluación'
          : 'EduGest'}
      </div>
    </aside>
  );
};

export default EduGestSidebar;
