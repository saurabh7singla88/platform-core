CREATE TABLE communication_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(64) NOT NULL,
    entity_type     VARCHAR(32) NOT NULL,
    entity_id       VARCHAR(128) NOT NULL,
    channel         VARCHAR(32) NOT NULL,
    direction       VARCHAR(16) NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'completed',
    event_timestamp TIMESTAMPTZ NOT NULL,
    subject         VARCHAR(512),
    summary         VARCHAR(500),
    source          VARCHAR(128) NOT NULL,
    external_id     VARCHAR(256) NOT NULL,
    participants    JSONB NOT NULL DEFAULT '[]',
    detail_ref      JSONB,
    attachments     JSONB NOT NULL DEFAULT '[]',
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT uq_tenant_source_external UNIQUE (tenant_id, source, external_id)
);

CREATE INDEX idx_timeline_query
    ON communication_events (tenant_id, entity_type, entity_id, event_timestamp DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_channel_filter
    ON communication_events (tenant_id, channel, event_timestamp DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_event_timestamp
    ON communication_events (event_timestamp DESC)
    WHERE deleted_at IS NULL;
