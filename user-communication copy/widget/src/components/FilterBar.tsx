import React from 'react';
import { Channel, Direction } from '../types';
import { getChannelIcon, getChannelLabel } from '../utils/format';

const ALL_CHANNELS: Channel[] = ['email', 'sms', 'call', 'voip', 'physical_mail', 'note', 'meeting'];
const ALL_DIRECTIONS: Direction[] = ['inbound', 'outbound', 'internal'];

interface Props {
  selectedChannels: Channel[];
  selectedDirections: Direction[];
  onChannelsChange: (channels: Channel[]) => void;
  onDirectionsChange: (directions: Direction[]) => void;
}

export const FilterBar: React.FC<Props> = ({
  selectedChannels,
  selectedDirections,
  onChannelsChange,
  onDirectionsChange
}) => {
  const toggleChannel = (ch: Channel) => {
    if (selectedChannels.includes(ch)) {
      onChannelsChange(selectedChannels.filter(c => c !== ch));
    } else {
      onChannelsChange([...selectedChannels, ch]);
    }
  };

  const toggleDirection = (dir: Direction) => {
    if (selectedDirections.includes(dir)) {
      onDirectionsChange(selectedDirections.filter(d => d !== dir));
    } else {
      onDirectionsChange([...selectedDirections, dir]);
    }
  };

  return (
    <div className="filter-bar">
      <div className="filter-bar__section">
        <span className="filter-bar__label">Channel:</span>
        <div className="filter-bar__pills">
          {ALL_CHANNELS.map(ch => (
            <button
              key={ch}
              className={`filter-pill ${selectedChannels.includes(ch) ? 'filter-pill--active' : ''}`}
              onClick={() => toggleChannel(ch)}
            >
              {getChannelIcon(ch)} {getChannelLabel(ch)}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-bar__section">
        <span className="filter-bar__label">Direction:</span>
        <div className="filter-bar__pills">
          {ALL_DIRECTIONS.map(dir => (
            <button
              key={dir}
              className={`filter-pill ${selectedDirections.includes(dir) ? 'filter-pill--active' : ''}`}
              onClick={() => toggleDirection(dir)}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
