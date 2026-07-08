import { useState, useMemo } from 'react';
import { TimelineEvent, FilterConfig, Channel } from '../types';
import { TimelineItem } from '../components/TimelineItem';

const ALL_CHANNELS: Channel[] = ['email', 'sms', 'call', 'voip', 'physical_mail', 'note', 'meeting'];

interface Props {
  events: TimelineEvent[];
  filter: FilterConfig;
  onFilterChange: (f: FilterConfig) => void;
  onEventClick: (evt: TimelineEvent) => void;
}

interface DateGroup {
  label: string;
  events: TimelineEvent[];
}

function groupByDate(events: TimelineEvent[]): DateGroup[] {
  const map = new Map<string, TimelineEvent[]>();
  for (const evt of events) {
    const label = new Date(evt.timestamp).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(evt);
  }
  return Array.from(map.entries()).map(([label, evts]) => ({ label, events: evts }));
}

export function TimelineView({ events, filter, onFilterChange, onEventClick }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    if (filter.channels?.length) {
      result = result.filter((e) => filter.channels!.includes(e.channel));
    }
    if (filter.dateFrom) result = result.filter((e) => e.timestamp >= filter.dateFrom!);
    if (filter.dateTo)   result = result.filter((e) => e.timestamp <= filter.dateTo!);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.subject?.toLowerCase().includes(q) ||
          e.summary?.toLowerCase().includes(q) ||
          e.participants.some(
            (p) => p.name.toLowerCase().includes(q) || p.identifier.toLowerCase().includes(q),
          ),
      );
    }
    return result;
  }, [events, filter, search]);

  const groups = groupByDate(filtered);

  const toggleChannel = (ch: Channel) => {
    const cur = filter.channels ?? [];
    const next = cur.includes(ch) ? cur.filter((c) => c !== ch) : [...cur, ch];
    onFilterChange({ ...filter, channels: next.length ? next : undefined });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filter bar */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '6px 10px', border: '1px solid #d1d5db',
            borderRadius: '6px', fontSize: '0.875rem', marginBottom: '8px',
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {ALL_CHANNELS.map((ch) => {
            const active = filter.channels?.includes(ch);
            return (
              <button
                key={ch}
                onClick={() => toggleChannel(ch)}
                style={{
                  padding: '3px 10px', borderRadius: '9999px', border: '1px solid',
                  borderColor: active ? '#6366f1' : '#d1d5db',
                  background: active ? '#6366f1' : '#fff',
                  color: active ? '#fff' : '#374151',
                  fontSize: '0.72rem', cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {ch.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
            No communications found.
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <div style={{
                padding: '6px 16px', fontSize: '0.72rem', fontWeight: 600,
                color: '#6b7280', background: '#f9fafb',
                borderBottom: '1px solid #f0f0f0',
                position: 'sticky', top: 0,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {group.label}
              </div>
              {group.events.map((evt) => (
                <TimelineItem key={evt.id} event={evt} onClick={onEventClick} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
