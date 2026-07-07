import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventDetail } from '../types';
import { fetchEventDetail } from '../services/api';
import { getChannelIcon, getDirectionIcon, getChannelLabel } from '../utils/format';

export const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    fetchEventDetail(eventId)
      .then(setEvent)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div className="widget-message">Loading...</div>;
  if (error) return <div className="widget-message widget-message--error">{error}</div>;
  if (!event) return <div className="widget-message">Event not found</div>;

  return (
    <div className="event-detail">
      <button className="event-detail__back" onClick={() => navigate('/')}>
        ← Back to timeline
      </button>

      <div className="event-detail__header">
        <span className="event-detail__channel">
          {getChannelIcon(event.channel)} {getChannelLabel(event.channel)}
        </span>
        <span className="event-detail__direction">
          {getDirectionIcon(event.direction)} {event.direction}
        </span>
        <span className={`event-detail__status event-detail__status--${event.status}`}>
          {event.status}
        </span>
      </div>

      <div className="event-detail__timestamp">
        {new Date(event.timestamp).toLocaleString()}
      </div>

      {event.subject && (
        <div className="event-detail__section">
          <h3>Subject</h3>
          <p>{event.subject}</p>
        </div>
      )}

      {event.participants.length > 0 && (
        <div className="event-detail__section">
          <h3>Participants</h3>
          <ul className="event-detail__participants">
            {event.participants.map((p, i) => (
              <li key={i}>
                <span className="participant-type">{p.type}:</span>{' '}
                {p.name ? `${p.name} (${p.identifier})` : p.identifier}
              </li>
            ))}
          </ul>
        </div>
      )}

      {event.summary && (
        <div className="event-detail__section">
          <h3>Summary</h3>
          <p>{event.summary}</p>
        </div>
      )}

      {event.detailRef && (
        <div className="event-detail__section">
          <h3>Source Content</h3>
          <p className="event-detail__ref">
            Type: {event.detailRef.type} | Ref: {event.detailRef.value}
          </p>
        </div>
      )}

      {event.attachments.length > 0 && (
        <div className="event-detail__section">
          <h3>Attachments</h3>
          <ul>
            {event.attachments.map((att, i) => (
              <li key={i}>
                <a href={att.ref} target="_blank" rel="noopener noreferrer">
                  {att.name} ({att.mimeType})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {Object.keys(event.metadata).length > 0 && (
        <details className="event-detail__section">
          <summary><h3>Metadata</h3></summary>
          <pre>{JSON.stringify(event.metadata, null, 2)}</pre>
        </details>
      )}

      <div className="event-detail__footer">
        <small>Source: {event.source} | External ID: {event.externalId}</small>
        <br />
        <small>Ingested: {new Date(event.createdAt).toLocaleString()}</small>
      </div>
    </div>
  );
};
