export type EntityType = 'contact' | 'lead' | 'account' | 'deal';
export type Channel = 'email' | 'sms' | 'call' | 'voip' | 'physical_mail' | 'note' | 'meeting';
export type Direction = 'inbound' | 'outbound' | 'internal';
export type EventStatus = 'completed' | 'missed' | 'failed' | 'pending' | 'scheduled';
export type SourceMode = 'webhook' | 'poll' | 'manual';

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

export interface CanonicalEvent {
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

export interface Source {
  id: string;
  tenantId: string;
  type: string;
  mode: SourceMode;
  credentialsRef?: string;
  pollingIntervalSeconds?: number;
  entityMapping?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  webhookUrl?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}
