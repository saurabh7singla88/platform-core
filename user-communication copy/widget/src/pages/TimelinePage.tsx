import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimelineEvent, Channel, Direction } from '../types';
import { fetchTimeline } from '../services/api';
import { TimelineItem } from '../components/TimelineItem';
import { FilterBar } from '../components/FilterBar';
import { formatDate } from '../utils/format';
import { useWidgetConfig } from '../context/ConfigContext';

export const TimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const config = useWidgetConfig();

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [directions, setDirections] = useState<Direction[]>([]);

  const loadTimeline = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTimeline({
        entityType: config.entityType,
        entityId: config.entityId,
        channels: channels.length > 0 ? channels : undefined,
        directions: directions.length > 0 ? directions : undefined,
        page,
        size: 25
      });
      setEvents(result.items);
      setTotal(result.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  }, [config, channels, directions, page]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
    // Notify host CRM
    window.parent.postMessage(
      { type: 'EVENT_CLICKED', payload: { eventId } },
      '*'
    );
  };

  // Group events by date
  const groupedEvents = events.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    const dateKey = new Date(event.timestamp).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  if (!config) {
    return <div className="widget-message">Waiting for configuration...</div>;
  }

  return (
    <div className="timeline-page">
      <FilterBar
        selectedChannels={channels}
        selectedDirections={directions}
        onChannelsChange={setChannels}
        onDirectionsChange={setDirections}
      />

      {loading && <div className="widget-message">Loading...</div>}
      {error && <div className="widget-message widget-message--error">{error}</div>}

      {!loading && !error && events.length === 0 && (
        <div className="widget-message">No communications found</div>
      )}

      <div className="timeline-list">
        {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
          <div key={dateKey} className="timeline-group">
            <div className="timeline-group__date">{formatDate(dateEvents[0].timestamp)}</div>
            {dateEvents.map(event => (
              <TimelineItem key={event.id} event={event} onClick={handleEventClick} />
            ))}
          </div>
        ))}
      </div>

      {total > 25 && (
        <div className="timeline-pagination">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span>Page {page + 1} of {Math.ceil(total / 25)}</span>
          <button disabled={(page + 1) * 25 >= total} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};
