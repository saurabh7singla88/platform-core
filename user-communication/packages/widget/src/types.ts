export type EntityType = 'contact' | 'lead' | 'account' | 'deal';
export type Channel = 'email' | 'sms' | 'call' | 'voip' | 'physical_mail' | 'note' | 'meeting';
export type Direction = 'inbound' | 'outbound' | 'internal';
export type EventStatus = 'completed' | 'missed' | 'failed' | 'pending' | 'scheduled';

export interface Participant {
  type: 'from' | 'to' | 'cc' | 'bcc';
  identifier: string;
  name: string;
}

export interface DetailRef {
  type: 'url' | 'provider_key';
  value: string;
}

export interface Attachment {
  name: string;
  mimeType: string;
  ref: string;
}

export interface TimelineEvent {
  id: string;
  tenantId: string;
  entityType: EntityType;
  entityId: string;
  channel: Channel;
  direction: Direction;
  status: EventStatus;
  timestamp: string;
  participants: Participant[];
  subject?: string;
  summary?: string;
  source: string;
  externalId: string;
  detailRef?: DetailRef;
  attachments: Attachment[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FilterConfig {
  channels?: Channel[];
  directions?: Direction[];
  dateFrom?: string;
  dateTo?: string;
}

export interface WidgetConfig {
  entityType: EntityType;
  entityId: string;
  token: string;
  baseUrl: string;
  theme: 'light' | 'dark';
  locale?: string;
  allowedOrigin?: string;
}

export type HostToWidgetMessage =
  | { type: 'INIT'; payload: WidgetConfig }
  | { type: 'SET_ENTITY'; payload: { entityType: EntityType; entityId: string } }
  | { type: 'SET_FILTER'; payload: FilterConfig }
  | { type: 'OPEN_EVENT'; payload: { eventId: string } }
  | { type: 'REFRESH' }
  | { type: 'TOKEN_REFRESH'; payload: { token: string } };

export type WidgetToHostMessage =
  | { type: 'WIDGET_LOADED' }
  | { type: 'EVENT_CLICKED'; payload: { eventId: string; channel: Channel } }
  | { type: 'WIDGET_ERROR'; payload: { code: string; message: string } }
  | { type: 'RESIZE'; payload: { height: number } }
  | { type: 'TOKEN_REQUEST' };
