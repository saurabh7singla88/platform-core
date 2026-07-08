import { Router, Request, Response } from 'express';
import pool from '../db';
import { extractTenant, getTenantId } from '../middleware/tenant';
import { v4 as uuidv4 } from 'uuid';

export const ingestRouter = Router();

const REQUIRED_FIELDS = ['entityType', 'entityId', 'channel', 'direction', 'status', 'timestamp', 'source', 'externalId'];

ingestRouter.post('/events', extractTenant, async (req: Request, res: Response): Promise<void> => {
  const event = req.body;

  for (const field of REQUIRED_FIELDS) {
    if (!event[field]) {
      res.status(400).json({ error: `Missing required field: ${field}` });
      return;
    }
  }

  const id = uuidv4();

  try {
    const result = await pool.query(
      `INSERT INTO events (
        id, tenant_id, entity_type, entity_id, channel, direction, status,
        timestamp, participants, subject, summary, source, external_id,
        detail_ref, attachments, metadata, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),NOW())
      ON CONFLICT (tenant_id, source, external_id) DO NOTHING
      RETURNING id`,
      [
        id,
        getTenantId(req),
        event.entityType,
        event.entityId,
        event.channel,
        event.direction,
        event.status,
        event.timestamp,
        JSON.stringify(event.participants ?? []),
        event.subject ?? null,
        event.summary ?? null,
        event.source,
        event.externalId,
        event.detailRef ? JSON.stringify(event.detailRef) : null,
        JSON.stringify(event.attachments ?? []),
        JSON.stringify(event.metadata ?? {}),
      ],
    );

    if (result.rowCount === 0) {
      res.status(409).json({ error: 'Duplicate event: (tenantId, source, externalId) already exists' });
      return;
    }

    res.status(201).json({ id });
  } catch (err) {
    console.error('Ingest error:', err);
    res.status(500).json({ error: 'Failed to ingest event' });
  }
});
