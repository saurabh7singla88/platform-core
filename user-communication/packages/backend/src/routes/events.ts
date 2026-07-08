import { Router, Request, Response } from 'express';
import pool from '../db';
import { extractTenant, getTenantId } from '../middleware/tenant';
import { toCanonicalEvent } from '../utils/mappers';

export const eventsRouter = Router();

eventsRouter.get('/events/:eventId', extractTenant, async (req: Request, res: Response): Promise<void> => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL',
      [eventId, getTenantId(req)],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json(toCanonicalEvent(result.rows[0]));
  } catch (err) {
    console.error('Event detail query error:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});
