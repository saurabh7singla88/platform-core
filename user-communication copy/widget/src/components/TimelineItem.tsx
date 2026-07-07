import React from 'react';
import { TimelineEvent } from '../types';
import { getChannelIcon, getDirectionIcon, getChannelLabel, formatTimestamp } from '../utils/format';

interface Props {
  event: TimelineEvent;
  onClick: (id: string) => void;
}

export const TimelineItem: React.FC<Props> = ({ event, onClick }) => {
  return (
    <div className="timeline-item" onClick={() => onClick(event.id)}>
      <div className="timeline-item__icon">
        <span className="channel-icon">{getChannelIcon(event.channel)}</span>
        <span className="direction-icon">{getDirectionIcon(event.direction)}</span>
      </div>
      <div className="timeline-item__content">
        <div className="timeline-item__header">
          <span className="timeline-item__channel">{getChannelLabel(event.channel)}</span>
          <span className={`timeline-item__status timeline-item__status--${event.status}`}>
            {event.status}
          </span>
          <span className="timeline-item__time">{formatTimestamp(event.timestamp)}</span>
        </div>
        {event.subject && (
          <div className="timeline-item__subject">{event.subject}</div>
        )}
        {event.summary && (
          <div className="timeline-item__summary">{event.summary}</div>
        )}
        {event.participants.length > 0 && (
          <div className="timeline-item__participants">
            {event.participants.map((p, i) => (
              <span key={i} className="participant-badge">
                {p.name || p.identifier}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
