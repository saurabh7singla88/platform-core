import { EventStatus } from '../types';

const COLORS: Record<EventStatus, { bg: string; color: string }> = {
  completed:  { bg: '#d1fae5', color: '#065f46' },
  missed:     { bg: '#fee2e2', color: '#991b1b' },
  failed:     { bg: '#fef3c7', color: '#92400e' },
  pending:    { bg: '#dbeafe', color: '#1e40af' },
  scheduled:  { bg: '#f3e8ff', color: '#6b21a8' },
};

export function StatusBadge({ status }: { status: EventStatus }) {
  const { bg, color } = COLORS[status];
  return (
    <span
      style={{
        background: bg,
        color,
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}
