import { useParams } from 'react-router-dom';
import { TimelineEvent } from '../types';
import { ChannelIcon } from '../components/ChannelIcon';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  events: TimelineEvent[];
  onBack: () => void;
}

const BTN: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#6366f1', fontSize: '0.875rem', padding: '4px 0',
};

const SECTION_LABEL: React.CSSProperties = {
  margin: '0 0 6px', fontSize: '0.7rem', fontWeight: 600,
  color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
};

export function DetailView({ events, onBack }: Props) {
  const { eventId } = useParams<{ eventId: string }>();
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6b7280' }}>
        <button onClick={onBack} style={BTN}>← Back</button>
        <p style={{ marginTop: '16px' }}>Event not found.</p>
      </div>
    );
  }

  const dirLabel =
    event.direction === 'inbound' ? '↓ Inbound'
    : event.direction === 'outbound' ? '↑ Outbound'
    : '↔ Internal';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid #e5e7eb', background: '#fff',
        display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
      }}>
        <button onClick={onBack} style={BTN}>← Back</button>
        <span style={{ fontSize: '1.2rem' }}><ChannelIcon channel={event.channel} /></span>
        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
          {event.channel.replace('_', ' ')}
        </span>
        <span style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{dirLabel}</span>
        <StatusBadge status={event.status} />
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#9ca3af', flexShrink: 0 }}>
          {new Date(event.timestamp).toLocaleString()}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {event.subject && (
          <h2 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 600 }}>{event.subject}</h2>
        )}

        {/* Participants */}
        <section style={{ marginBottom: '16px' }}>
          <h3 style={SECTION_LABEL}>Participants</h3>
          {event.participants.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.875rem', marginBottom: '4px' }}>
              <span style={{ color: '#9ca3af', minWidth: '28px', textTransform: 'capitalize' }}>{p.type}</span>
              <span style={{ fontWeight: 500 }}>{p.name}</span>
              <span style={{ color: '#6b7280' }}>{p.identifier}</span>
            </div>
          ))}
        </section>

        {/* Summary */}
        {event.summary && (
          <section style={{ marginBottom: '16px' }}>
            <h3 style={SECTION_LABEL}>Summary</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>
              {event.summary}
            </p>
          </section>
        )}

        {/* Recording / Detail ref */}
        {event.detailRef && (
          <section style={{ marginBottom: '16px' }}>
            <h3 style={SECTION_LABEL}>Recording / Content</h3>
            {event.detailRef.type === 'url' ? (
              <a
                href={event.detailRef.value}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.875rem', color: '#6366f1' }}
              >
                Open in source system ↗
              </a>
            ) : (
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{event.detailRef.value}</span>
            )}
          </section>
        )}

        {/* Attachments */}
        {event.attachments.length > 0 && (
          <section style={{ marginBottom: '16px' }}>
            <h3 style={SECTION_LABEL}>Attachments</h3>
            {event.attachments.map((att, i) => (
              <div key={i} style={{ fontSize: '0.875rem', marginBottom: '4px' }}>
                <a href={att.ref} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>
                  {att.name}
                </a>
                <span style={{ color: '#9ca3af', marginLeft: '8px', fontSize: '0.75rem' }}>
                  {att.mimeType}
                </span>
              </div>
            ))}
          </section>
        )}

        {/* Metadata */}
        {Object.keys(event.metadata).length > 0 && (
          <details style={{ marginBottom: '16px' }}>
            <summary style={{ ...SECTION_LABEL, cursor: 'pointer', display: 'block' }}>
              Metadata
            </summary>
            <pre style={{
              margin: '8px 0 0', fontSize: '0.72rem', background: '#f9fafb',
              padding: '8px', borderRadius: '4px', overflowX: 'auto',
            }}>
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </details>
        )}

        <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '8px' }}>
          Source: {event.source} · ID: {event.externalId}
        </div>
      </div>
    </div>
  );
}
