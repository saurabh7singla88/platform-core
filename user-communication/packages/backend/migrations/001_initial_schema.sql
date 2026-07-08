-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS events (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     VARCHAR     NOT NULL,
  entity_type   VARCHAR     NOT NULL CHECK (entity_type IN ('contact', 'lead', 'account', 'deal')),
  entity_id     VARCHAR     NOT NULL,
  channel       VARCHAR     NOT NULL CHECK (channel IN ('email', 'sms', 'call', 'voip', 'physical_mail', 'note', 'meeting')),
  direction     VARCHAR     NOT NULL CHECK (direction IN ('inbound', 'outbound', 'internal')),
  status        VARCHAR     NOT NULL CHECK (status IN ('completed', 'missed', 'failed', 'pending', 'scheduled')),
  timestamp     TIMESTAMPTZ NOT NULL,
  participants  JSONB       NOT NULL DEFAULT '[]',
  subject       TEXT,
  summary       VARCHAR(500),
  source        VARCHAR     NOT NULL,
  external_id   VARCHAR     NOT NULL,
  detail_ref    JSONB,
  attachments   JSONB       NOT NULL DEFAULT '[]',
  metadata      JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,

  CONSTRAINT uq_events_dedup UNIQUE (tenant_id, source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_events_timeline
  ON events (tenant_id, entity_type, entity_id, timestamp DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS sources (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 VARCHAR     NOT NULL,
  type                      VARCHAR     NOT NULL,
  mode                      VARCHAR     NOT NULL CHECK (mode IN ('webhook', 'poll', 'manual')),
  credentials_ref           VARCHAR,
  polling_interval_seconds  INTEGER,
  entity_mapping            JSONB,
  filters                   JSONB,
  webhook_url               VARCHAR,
  signing_secret            VARCHAR,
  last_synced_at            TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sources_tenant
  ON sources (tenant_id, type, mode);
