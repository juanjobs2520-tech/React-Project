interface StatusBadgeProps {
  variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  label: string;
}

const StatusBadge = ({ variant, label }: StatusBadgeProps) => (
  <span className={`edugest-badge edugest-badge-${variant}`}>{label}</span>
);

export default StatusBadge;
