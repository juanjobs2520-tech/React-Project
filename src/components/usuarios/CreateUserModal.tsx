import { useState } from 'react';
import Modal from '../common/Modal';
import { CreateUserPayload } from '../../models/User';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: CreateUserPayload) => Promise<void>;
}

const emptyAccount = { email: '', password: '', code: '', role: 'TEACHER' as const };
const emptyProfile = {
  first_name: '',
  last_name: '',
  identification: '',
  phone: '',
  specialty: '',
};

const CreateUserModal = ({ open, onClose, onSave }: CreateUserModalProps) => {
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState(emptyAccount);
  const [profile, setProfile] = useState(emptyProfile);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setStep(1);
    setAccount(emptyAccount);
    setProfile(emptyProfile);
    setError('');
    setShowPassword(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateStep1 = () => {
    if (!account.email || !account.password || !account.code) {
      setError('Complete los campos obligatorios.');
      return false;
    }
    if (account.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!profile.first_name || !profile.last_name || !profile.identification) {
      setError('Complete los datos del perfil.');
      return false;
    }
    if (account.role === 'TEACHER' && !profile.specialty) {
      setError('La especialidad es obligatoria para docentes.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSave = async () => {
    if (!validateStep2()) return;
    setSaving(true);
    try {
      const payload: CreateUserPayload = {
        email: account.email,
        password: account.password,
        code: account.code,
        role: account.role,
        first_name: profile.first_name,
        last_name: profile.last_name,
        identification: profile.identification,
        ...(account.role === 'TEACHER'
          ? { phone: profile.phone, specialty: profile.specialty }
          : {}),
      };
      await onSave(payload);
      handleClose();
    } catch {
      /* parent shows toast */
    } finally {
      setSaving(false);
    }
  };

  const footer =
    step === 1 ? (
      <>
        <button type="button" className="edugest-btn edugest-btn-secondary" onClick={handleClose}>
          Cancelar
        </button>
        <button type="button" className="edugest-btn edugest-btn-primary" onClick={handleNext}>
          Siguiente
        </button>
      </>
    ) : (
      <>
        <button type="button" className="edugest-btn edugest-btn-secondary" onClick={() => setStep(1)}>
          Atrás
        </button>
        <button
          type="button"
          className="edugest-btn edugest-btn-primary"
          disabled={saving}
          onClick={handleSave}
        >
          Guardar usuario
        </button>
      </>
    );

  return (
    <Modal
      open={open}
      title={step === 1 ? 'Crear usuario — Datos de usuario' : 'Crear usuario — Datos de perfil'}
      onClose={handleClose}
      footer={footer}
      size="lg"
    >
      {step === 1 ? (
        <>
          <p className="edugest-info-note">
            Los datos del perfil se completan en la siguiente pestaña según el rol seleccionado.
          </p>
          <div className="edugest-field">
            <label>Email *</label>
            <input
              className="edugest-input"
              type="email"
              value={account.email}
              onChange={(e) => setAccount({ ...account, email: e.target.value })}
            />
          </div>
          <div className="edugest-field">
            <label>Contraseña * (mín. 8 caracteres)</label>
            <div className="edugest-actions-cell">
              <input
                className="edugest-input"
                type={showPassword ? 'text' : 'password'}
                value={account.password}
                onChange={(e) => setAccount({ ...account, password: e.target.value })}
              />
              <button
                type="button"
                className="edugest-btn edugest-btn-secondary"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
          <div className="edugest-field">
            <label>Código *</label>
            <input
              className="edugest-input"
              value={account.code}
              onChange={(e) => setAccount({ ...account, code: e.target.value })}
            />
          </div>
          <div className="edugest-field">
            <label>Rol *</label>
            <select
              className="edugest-select"
              value={account.role}
              onChange={(e) =>
                setAccount({ ...account, role: e.target.value as 'TEACHER' | 'STUDENT' })
              }
            >
              <option value="TEACHER">Docente</option>
              <option value="STUDENT">Estudiante</option>
            </select>
          </div>
        </>
      ) : (
        <>
          <p className="edugest-info-note">
            Complete los datos del perfil según el rol seleccionado.
          </p>
          <div className="edugest-tabs">
            <button
              type="button"
              className={`edugest-tab ${account.role === 'TEACHER' ? 'edugest-tab-active' : ''}`}
              onClick={() => setAccount({ ...account, role: 'TEACHER' })}
            >
              Docente
            </button>
            <button
              type="button"
              className={`edugest-tab ${account.role === 'STUDENT' ? 'edugest-tab-active' : ''}`}
              onClick={() => setAccount({ ...account, role: 'STUDENT' })}
            >
              Estudiante
            </button>
          </div>
          <div className="edugest-field">
            <label>Nombre *</label>
            <input
              className="edugest-input"
              value={profile.first_name}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            />
          </div>
          <div className="edugest-field">
            <label>Apellido *</label>
            <input
              className="edugest-input"
              value={profile.last_name}
              onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            />
          </div>
          <div className="edugest-field">
            <label>Cédula *</label>
            <input
              className="edugest-input"
              value={profile.identification}
              onChange={(e) => setProfile({ ...profile, identification: e.target.value })}
            />
          </div>
          {account.role === 'TEACHER' && (
            <>
              <div className="edugest-field">
                <label>Teléfono</label>
                <input
                  className="edugest-input"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div className="edugest-field">
                <label>Especialidad *</label>
                <input
                  className="edugest-input"
                  value={profile.specialty}
                  onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                />
              </div>
            </>
          )}
          {account.role === 'STUDENT' && (
            <div className="edugest-field">
              <label>Teléfono</label>
              <input
                className="edugest-input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          )}
        </>
      )}
      {error && <p className="edugest-badge edugest-badge-danger">{error}</p>}
    </Modal>
  );
};

export default CreateUserModal;
