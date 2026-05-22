import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}

const Modal = ({ open, title, onClose, children, footer, size = 'md' }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="edugest-modal-overlay" role="dialog" aria-modal="true">
      <div className={`edugest-modal ${size === 'lg' ? 'edugest-modal-lg' : ''}`}>
        <div className="edugest-modal-header">
          <h3 className="edugest-modal-title">{title}</h3>
          <button type="button" className="edugest-icon-btn" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="edugest-modal-body">{children}</div>
        {footer && <div className="edugest-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
