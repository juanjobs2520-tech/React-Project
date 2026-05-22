import Modal from '../common/Modal';
import { User } from '../../models/User';
import { getUserFullName } from '../../utils/userHelpers';

interface DeactivateUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeactivateUserModal = ({ open, user, onClose, onConfirm }: DeactivateUserModalProps) => {
  if (!user) return null;

  return (
    <Modal
      open={open}
      title="Desactivar usuario"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="edugest-btn edugest-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="edugest-btn edugest-btn-danger" onClick={onConfirm}>
            Desactivar usuario
          </button>
        </>
      }
    >
      <div className="edugest-empty">
        <span className="edugest-badge edugest-badge-danger">✕</span>
      </div>
      <p>
        <strong>¿Está seguro que desea desactivar este usuario?</strong>
      </p>
      <p className="edugest-info-note">
        El usuario no podrá iniciar sesión pero su información se mantendrá en el sistema.
      </p>
      <div className="edugest-card">
        <div className="edugest-card-body">
          <div className="edugest-detail-row">
            <span className="edugest-detail-label">Nombre</span>
            <span>{getUserFullName(user)}</span>
          </div>
          <div className="edugest-detail-row">
            <span className="edugest-detail-label">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="edugest-detail-row">
            <span className="edugest-detail-label">Código</span>
            <span>{user.code}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeactivateUserModal;
