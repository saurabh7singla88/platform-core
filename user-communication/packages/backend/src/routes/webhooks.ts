import { Router, Request, Response } from 'express';
import express from 'express';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const webhooksRouter = Router();

webhooksRouter.post(
  '/:sourceType/:tenantId',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    const { sourceType, tenantId } = req.params;

    try {
      const sourceResult = await pool.query(
        'SELECT * FROM sources WHERE tenant_id = $1 AND type = $2 AND mode = $3 LIMIT 1',
        [tenantId, sourceType, 'webhook'],
      );

      if (sourceResult.rows.length === 0) {
        res.status(404).json({ error: 'No webhook source configured for this tenant and type' });
        return;
      }

      const source = sourceResult.rows[0];

      // Validate HMAC signature when a signing secret is configured
      if (source.signing_secret) {
        const signature = req.headers['x-webhook-signature'] as string | undefined;
        if (!signature) {
          res.status(401).json({ error: 'Missing x-webhook-signature header' });
          return;
        }

        const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
        const expected = crypto
          .createHmac('sha256', source.signing_secret as string)
          .update(rawBody)
          .digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
          res.status(401).json({ error: 'Invalid webhook signature' });
          return;
        }
      }

      const payload = Buffer.isBuffer(req.body)
        ? JSON.parse(req.body.toString())
        : req.body;

      // Phase 1: expects pre-normalized payload matching canonical event shape.
      // Phase 2 will add per-source normalizers.
      const id = uuidv4();

      await pool.query(
        `INSERT INTO events (
          id, tenant_id, entity_type, entity_id, channel, direction, status,
          timestamp, participants, subject, summary, source, external_id,
          detail_ref, attachments, metadata, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),NOW())
        ON CONFLICT (tenant_id, source, external_id) DO NOTHING`,
        [
          id, tenantId,
          payload.entityType, payload.entityId,
          payload.channel, payload.direction, payload.status,
          payload.timestamp,
          JSON.stringify(payload.participants ?? []),
          payload.subject ?? null,
          payload.summary ?? null,
          sourceType,
          payload.externalId,
          payload.detailRef ? JSON.stringify(payload.detailRef) : null,
          JSON.stringify(payload.attachments ?? []),
          JSON.stringify(payload.metadata ?? {}),
        ],
      );

      res.status(200).json({ received: true });
    } catch (err) {
      console.error('Webhook processing error:', err);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  },
);
