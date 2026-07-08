import { Router, Request, Response } from 'express';
import pool from '../db';
import { extractTenant, getTenantId } from '../middleware/tenant';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const adminRouter = Router();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSource(row: Record<string, any>) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    type: row.type,
    mode: row.mode,
    credentialsRef: row.credentials_ref ?? undefined,
    pollingIntervalSeconds: row.polling_interval_seconds ?? undefined,
    entityMapping: row.entity_mapping ?? undefined,
    filters: row.filters ?? undefined,
    webhookUrl: row.webhook_url ?? undefined,
    lastSyncedAt: row.last_synced_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

adminRouter.post('/sources', extractTenant, async (req: Request, res: Response): Promise<void> => {
  const { type, mode, credentials, pollingIntervalSeconds, entityMapping, filters } = req.body;

  if (!type || !mode) {
    res.status(400).json({ error: 'type and mode are required' });
    return;
  }

  const id = uuidv4();
  let webhookUrl: string | null = null;
  let signingSecret: string | null = null;

  if (mode === 'webhook') {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;
    webhookUrl = `${baseUrl}/webhooks/${type}/${getTenantId(req)}`;
    signingSecret = crypto.randomBytes(32).toString('hex');
  }

  try {
    await pool.query(
      `INSERT INTO sources (id, tenant_id, type, mode, credentials_ref, polling_interval_seconds, entity_mapping, filters, webhook_url, signing_secret, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`,
      [
        id, getTenantId(req), type, mode, credentials ?? null,
        pollingIntervalSeconds ?? null,
        entityMapping ? JSON.stringify(entityMapping) : null,
        filters ? JSON.stringify(filters) : null,
        webhookUrl, signingSecret,
      ],
    );

    const result = await pool.query('SELECT * FROM sources WHERE id = $1', [id]);
    const source = toSource(result.rows[0]);

    res.status(201).json(mode === 'webhook' ? { ...source, signingSecret } : source);
  } catch (err) {
    console.error('Create source error:', err);
    res.status(500).json({ error: 'Failed to create source' });
  }
});

adminRouter.get('/sources', extractTenant, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM sources WHERE tenant_id = $1 ORDER BY created_at DESC',
      [getTenantId(req)],
    );
    res.json(result.rows.map(toSource));
  } catch (err) {
    console.error('List sources error:', err);
    res.status(500).json({ error: 'Failed to list sources' });
  }
});

adminRouter.put('/sources/:id', extractTenant, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { type, mode, credentials, pollingIntervalSeconds, entityMapping, filters } = req.body;

  try {
    const result = await pool.query(
      `UPDATE sources
       SET type = COALESCE($1, type),
           mode = COALESCE($2, mode),
           credentials_ref = COALESCE($3, credentials_ref),
           polling_interval_seconds = COALESCE($4, polling_interval_seconds),
           entity_mapping = COALESCE($5, entity_mapping),
           filters = COALESCE($6, filters),
           updated_at = NOW()
       WHERE id = $7 AND tenant_id = $8
       RETURNING *`,
      [
        type ?? null, mode ?? null, credentials ?? null, pollingIntervalSeconds ?? null,
        entityMapping ? JSON.stringify(entityMapping) : null,
        filters ? JSON.stringify(filters) : null,
        id, getTenantId(req),
      ],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Source not found' });
      return;
    }

    res.json(toSource(result.rows[0]));
  } catch (err) {
    console.error('Update source error:', err);
    res.status(500).json({ error: 'Failed to update source' });
  }
});

adminRouter.delete('/sources/:id', extractTenant, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM sources WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, getTenantId(req)],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Source not found' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error('Delete source error:', err);
    res.status(500).json({ error: 'Failed to delete source' });
  }
});

adminRouter.get('/sources/:id/status', extractTenant, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM sources WHERE id = $1 AND tenant_id = $2',
      [id, getTenantId(req)],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Source not found' });
      return;
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      type: row.type,
      mode: row.mode,
      lastSyncedAt: row.last_synced_at ?? null,
      status: 'active',
    });
  } catch (err) {
    console.error('Source status error:', err);
    res.status(500).json({ error: 'Failed to fetch source status' });
  }
});
