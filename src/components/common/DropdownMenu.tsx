import { useEffect, useRef, useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';

export interface DropdownItem {
  id: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
}

const DropdownMenu = ({ items }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="edugest-dropdown" ref={ref}>
      <button
        type="button"
        className="edugest-icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Más acciones"
      >
        <FiMoreVertical />
      </button>
      {open && (
        <div className="edugest-dropdown-menu">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`edugest-dropdown-item ${item.danger ? 'edugest-dropdown-item-danger' : ''}`}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
