import { Channel } from '../types';

const ICONS: Record<Channel, string> = {
  email: '✉️',
  sms: '💬',
  call: '📞',
  voip: '📱',
  physical_mail: '📮',
  note: '📝',
  meeting: '📅',
};

export function ChannelIcon({ channel }: { channel: Channel }) {
  return <span role="img" aria-label={channel}>{ICONS[channel]}</span>;
}
