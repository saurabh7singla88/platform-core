import { CanonicalEvent } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toCanonicalEvent(row: Record<string, any>): CanonicalEvent {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    channel: row.channel,
    direction: row.direction,
    status: row.status,
    timestamp: row.timestamp,
    participants: row.participants,
    subject: row.subject ?? undefined,
    summary: row.summary ?? undefined,
    source: row.source,
    externalId: row.external_id,
    detailRef: row.detail_ref ?? undefined,
    attachments: row.attachments,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
