export interface TimelineEvent {
  id: string;
  channel: Channel;
  direction: Direction;
  status: string;
  timestamp: string;
  subject: string | null;
  summary: string | null;
  participants: Participant[];
  source: string;
  attachments: Attachment[];
}

export interface EventDetail extends TimelineEvent {
  tenantId: string;
  entityType: string;
  entityId: string;
  externalId: string;
  detailRef: DetailRef | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  type: string;
  identifier: string;
  name?: string;
}

export interface Attachment {
  name: string;
  mimeType: string;
  ref: string;
}

export interface DetailRef {
  type: string;
  value: string;
}

export interface TimelineResponse {
  items: TimelineEvent[];
  pagination: {
    page: number;
    size: number;
    total: number;
  };
}

export type Channel = 'email' | 'sms' | 'call' | 'voip' | 'physical_mail' | 'note' | 'meeting';
export type Direction = 'inbound' | 'outbound' | 'internal';

export interface WidgetConfig {
  entityType: string;
  entityId: string;
  tenantId: string;
  baseUrl: string;
  token: string;
}
