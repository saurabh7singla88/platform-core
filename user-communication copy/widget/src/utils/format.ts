import { Channel, Direction } from '../types';

const CHANNEL_ICONS: Record<Channel, string> = {
  email: '✉️',
  sms: '💬',
  call: '📞',
  voip: '🎧',
  physical_mail: '📦',
  note: '📝',
  meeting: '📅'
};

const DIRECTION_ARROWS: Record<Direction, string> = {
  inbound: '⬅️',
  outbound: '➡️',
  internal: '🔄'
};

export function getChannelIcon(channel: Channel): string {
  return CHANNEL_ICONS[channel] || '📋';
}

export function getDirectionIcon(direction: Direction): string {
  return DIRECTION_ARROWS[direction] || '';
}

export function getChannelLabel(channel: Channel): string {
  return channel.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - eventDate.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
