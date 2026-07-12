import { TimelineEvent } from '../types';
import { ChannelIcon } from './ChannelIcon';
import { StatusBadge } from './StatusBadge';

interface Props {
  event: TimelineEvent;
  onClick: (event: TimelineEvent) => void;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function TimelineItem({ event, onClick }: Props) {
  const from = event.participants.find((p) => p.type === 'from');
  const to = event.participants.find((p) => p.type === 'to');
  const dirArrow = event.direction === 'inbound' ? '↓' : event.direction === 'outbound' ? '↑' : '↔';

  const label = [
    event.channel.replace('_', ' '),
    event.direction,
    from?.name || from?.identifier,
    event.subject,
  ].filter(Boolean).join(' — ');

  return (
    <div
      role="article"
      aria-label={label}
      data-timeline-item
      tabIndex={0}
      onClick={() => onClick(event)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(event); } }}
      style={{
        display: 'flex', gap: '12px', padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
        outline: 'none',
      }}
      onFocus={(e) => (e.currentTarget.style.background = '#f0f4ff')}
      onBlur={(e) => (e.currentTarget.style.background = '')}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
    >
      <div style={{ fontSize: '1.4rem', flexShrink: 0, paddingTop: '1px' }}>
        <ChannelIcon channel={event.channel} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {dirArrow} {from?.name || from?.identifier || '—'}
            </span>
            {to && (
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                → {to.name || to.identifier}
              </span>
            )}
            <StatusBadge status={event.status} />
          </div>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af', flexShrink: 0 }}>
            {relativeTime(event.timestamp)}
          </span>
        </div>

        {event.subject && (
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginTop: '2px' }}>
            {event.subject}
          </div>
        )}
        {event.summary && (
          <div style={{
            fontSize: '0.8125rem', color: '#6b7280', marginTop: '2px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {event.summary}
          </div>
        )}
      </div>
    </div>
  );
}
