import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { User } from '../../models/User';
import { getProfile, getUserFullName } from '../../utils/userHelpers';

interface EditUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (id: string, payload: Partial<User>) => Promise<void>;
}

const EditUserModal = ({ open, user, onClose, onSave }: EditUserModalProps) => {
  const [tab, setTab] = useState<'account' | 'profile'>('account');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState('TEACHER');
  const [isActive, setIsActive] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [identification, setIdentification] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const profile = getProfile(user);
    setEmail(user.email ?? '');
    setCode(user.code ?? '');
    setRole(user.role ?? 'TEACHER');
    setIsActive(user.is_active !== false);
    setFirstName(profile?.first_name ?? '');
    setLastName(profile?.last_name ?? '');
    setIdentification(profile?.identification ?? '');
    setPhone((profile as { phone?: string })?.phone ?? '');
    setSpecialty((profile as { specialty?: string })?.specialty ?? '');
    setTab('account');
  }, [user]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await onSave(user.id, {
        email,
        code,
        role,
        is_active: isActive,
        first_name: firstName,
        last_name: lastName,
        identification,
        phone,
        specialty,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      open={open}
      title={`Editar usuario — ${getUserFullName(user)}`}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="edugest-btn edugest-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="edugest-btn edugest-btn-primary"
            disabled={saving}
            onClick={handleSave}
          >
            Guardar cambios
          </button>
        </>
      }
    >
      <div className="edugest-tabs">
        <button
          type="button"
          className={`edugest-tab ${tab === 'account' ? 'edugest-tab-active' : ''}`}
          onClick={() => setTab('account')}
        >
          Datos de usuario
        </button>
        <button
          type="button"
          className={`edugest-tab ${tab === 'profile' ? 'edugest-tab-active' : ''}`}
          onClick={() => setTab('profile')}
        >
          Datos de perfil
        </button>
      </div>

      {tab === 'account' ? (
        <>
          <div className="edugest-field">
            <label>Email</label>
            <input className="edugest-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="edugest-field">
            <label>Código</label>
            <input className="edugest-input" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="edugest-field">
            <label>Rol</label>
            <select className="edugest-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="TEACHER">Docente</option>
              <option value="STUDENT">Estudiante</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div className="edugest-field">
            <label>Estado</label>
            <select
              className="edugest-select"
              value={isActive ? 'active' : 'inactive'}
              onChange={(e) => setIsActive(e.target.value === 'active')}
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </>
      ) : (
        <>
          <div className="edugest-field">
            <label>Nombre</label>
            <input
              className="edugest-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="edugest-field">
            <label>Apellido</label>
            <input
              className="edugest-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="edugest-field">
            <label>Cédula</label>
            <input
              className="edugest-input"
              value={identification}
              onChange={(e) => setIdentification(e.target.value)}
            />
          </div>
          {role === 'TEACHER' && (
            <>
              <div className="edugest-field">
                <label>Teléfono</label>
                <input className="edugest-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="edugest-field">
                <label>Especialidad</label>
                <input
                  className="edugest-input"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                />
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
};

export default EditUserModal;
