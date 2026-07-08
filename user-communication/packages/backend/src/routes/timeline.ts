import { Router, Request, Response } from 'express';
import pool from '../db';
import { extractTenant, getTenantId } from '../middleware/tenant';
import { toCanonicalEvent } from '../utils/mappers';

export const timelineRouter = Router();

timelineRouter.get('/timeline', extractTenant, async (req: Request, res: Response): Promise<void> => {
  const { entityType, entityId, channels, from, to, page = '1', size = '25' } = req.query;

  if (!entityType || !entityId) {
    res.status(400).json({ error: 'entityType and entityId are required' });
    return;
  }

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(size as string, 10)));
  const offset = (pageNum - 1) * pageSize;

  const conditions: string[] = [
    'tenant_id = $1',
    'entity_type = $2',
    'entity_id = $3',
    'deleted_at IS NULL',
  ];
  const params: unknown[] = [getTenantId(req), entityType, entityId];
  let p = 4;

  if (channels) {
    const channelList = (channels as string).split(',').map((c) => c.trim());
    conditions.push(`channel = ANY($${p}::text[])`);
    params.push(channelList);
    p++;
  }

  if (from) {
    conditions.push(`timestamp >= $${p}`);
    params.push(from);
    p++;
  }

  if (to) {
    conditions.push(`timestamp <= $${p}`);
    params.push(to);
    p++;
  }

  const where = conditions.join(' AND ');

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM events WHERE ${where}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await pool.query(
      `SELECT * FROM events WHERE ${where} ORDER BY timestamp DESC LIMIT $${p} OFFSET $${p + 1}`,
      [...params, pageSize, offset],
    );

    res.json({
      items: dataResult.rows.map(toCanonicalEvent),
      pagination: { page: pageNum, size: pageSize, total },
    });
  } catch (err) {
    console.error('Timeline query error:', err);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});
