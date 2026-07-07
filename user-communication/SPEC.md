# CRM Communication Timeline SDK — Product Specification

1
## 1. Overview

An independent, plug-and-play SDK that provides a unified communication timeline for any CRM. It logs, indexes, and displays all user communications (calls, SMS, email, VoIP, physical mail) in a single embeddable widget.

### Key Principles
- CRM-agnostic: works with any CRM via iframe + SDK
- Pointer-first storage: own DB stores metadata/index only; heavy payloads (recordings, attachments) remain in source systems
- Dual ingestion: webhook push + scheduled pull + generic ingest API
- Immutable audit trail for compliance

---

## 2. System Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend API | Java (Spring Boot) + PostgreSQL | Timeline/detail APIs, ingestion, admin |
| Widget App | React + TypeScript | Embeddable iframe UI (timeline + details) |
| Host SDK | JavaScript/TypeScript | Mounts iframe, passes context, exposes methods |
| Connector Layer | Java | Source adapters for push/pull ingestion |

---

## 3. Channel Taxonomy

| Channel | Direction | Examples |
|---------|-----------|----------|
| `email` | inbound / outbound | Gmail, Outlook, IMAP |
| `sms` | inbound / outbound | Twilio, custom gateway |
| `call` | inbound / outbound | PBX, mobile, landline |
| `voip` | inbound / outbound | Twilio Voice, RingCentral, Zoom Phone |
| `physical_mail` | inbound / outbound | Postal, courier |
| `note` | internal | Manual agent notes |
| `meeting` | — | Calendar events (optional) |

---

## 4. Data Model

### 4.1 Canonical Event (stored in own DB)

```json
{
  "id": "uuid",
  "tenantId": "string",
  "entityType": "contact | lead | account | deal",
  "entityId": "string",
  "channel": "email | sms | call | voip | physical_mail | note | meeting",
  "direction": "inbound | outbound | internal",
  "status": "completed | missed | failed | pending | scheduled",
  "timestamp": "ISO-8601",
  "participants": [
    { "type": "from | to | cc | bcc", "identifier": "string", "name": "string" }
  ],
  "subject": "string (nullable)",
  "summary": "string (short snippet, max 500 chars)",
  "source": "string (source system identifier)",
  "externalId": "string (id in source system)",
  "detailRef": {
    "type": "url | provider_key",
    "value": "string (pointer to full content in source)"
  },
  "attachments": [
    { "name": "string", "mimeType": "string", "ref": "string (URL or key)" }
  ],
  "metadata": {},
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

### 4.2 Deduplication Key

```
UNIQUE (tenantId, source, externalId)
```

### 4.3 What Is NOT Stored

- Full email bodies (fetched on demand from source)
- Call/VoIP recordings (referenced by URL/key)
- Large attachments (referenced, not copied)
- Raw webhook payloads (stored temporarily for debugging, purged by TTL)

---

## 5. Ingestion Design

### 5.1 Mode 1 — Webhook Push (Real-Time)

- Source systems push events to SDK's webhook endpoint
- Endpoint: `POST /webhooks/{sourceType}/{tenantId}`
- Signature validation per source type
- Normalize → deduplicate → store
- Idempotent (409 on duplicate externalId)

### 5.2 Mode 2 — Pull Connector (Scheduled)

- User configures connection credentials + polling interval
- Scheduler fetches new events since last cursor/timestamp
- Normalize → deduplicate → store
- Supports: IMAP, CRM table queries, legacy APIs

### 5.3 Mode 3 — Generic Ingest API (Custom Sources)

- For unsupported/custom systems
- Endpoint: `POST /ingest/events`
- Accepts pre-normalized event payload
- Same deduplication rules apply

### 5.4 Source Configuration

```
POST /admin/sources
{
  "type": "twilio_sms | gmail | imap | hubspot | custom",
  "mode": "webhook | poll | manual",
  "credentials": "vault://ref (encrypted reference)",
  "pollingIntervalSeconds": 300,
  "entityMapping": {
    "identifierField": "phone | email",
    "entityType": "contact"
  },
  "filters": {
    "directions": ["inbound", "outbound"],
    "channels": ["sms"]
  }
}
```

Response (webhook mode):
```json
{
  "id": "source-uuid",
  "webhookUrl": "https://api.widget.com/webhooks/twilio_sms/{tenantId}",
  "signingSecret": "hmac-secret"
}
```

---

## 6. API Specification

### 6.1 Timeline API

```
GET /api/v1/timeline?entityType={type}&entityId={id}&channels={csv}&from={iso}&to={iso}&page={n}&size={n}
```

Response:
```json
{
  "items": [ /* canonical events, sorted desc by timestamp */ ],
  "pagination": { "page": 1, "size": 25, "total": 142 }
}
```

### 6.2 Event Detail API

```
GET /api/v1/events/{eventId}
```

Response: full canonical event + on-demand fetched content from source (email body, call transcript, etc.)

### 6.3 Admin APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/admin/sources` | Create source config |
| GET | `/admin/sources` | List configured sources |
| PUT | `/admin/sources/{id}` | Update source config |
| DELETE | `/admin/sources/{id}` | Remove source config |
| GET | `/admin/sources/{id}/status` | Health/sync status |

### 6.4 Ingest API

```
POST /ingest/events
```

Body: canonical event payload (without `id`, `createdAt`, `updatedAt`)

---

## 7. Host SDK Interface

### 7.1 Embed Snippet

```html
<script src="https://cdn.widget.com/sdk/v1/comm-timeline.js"></script>
<script>
  CRMCommTimeline.mount({
    containerId: 'timeline-container',
    entityType: 'contact',
    entityId: '12345',
    token: 'jwt-token',
    baseUrl: 'https://api.widget.com',
    theme: 'light',
    onEventClick: function(event) { /* optional host callback */ },
    onError: function(error) { /* optional */ }
  });
</script>
```

### 7.2 SDK Methods

```typescript
interface CRMCommTimelineSDK {
  mount(config: MountConfig): void;
  unmount(): void;
  setEntity(entityType: string, entityId: string): void;
  refresh(): void;
  openEvent(eventId: string): void;
  setFilter(filter: FilterConfig): void;
  destroy(): void;
}

interface MountConfig {
  containerId: string;
  entityType: string;
  entityId: string;
  token: string;
  baseUrl: string;
  theme?: 'light' | 'dark';
  locale?: string;
  onEventClick?: (event: TimelineEvent) => void;
  onLoaded?: () => void;
  onError?: (error: SDKError) => void;
}

interface FilterConfig {
  channels?: string[];
  directions?: string[];
  dateFrom?: string;
  dateTo?: string;
}
```

### 7.3 Iframe ↔ Host Communication

Protocol: `window.postMessage` with origin validation.

Messages from host → widget:
```json
{ "type": "SET_ENTITY", "payload": { "entityType": "contact", "entityId": "123" } }
{ "type": "SET_FILTER", "payload": { "channels": ["email", "sms"] } }
{ "type": "OPEN_EVENT", "payload": { "eventId": "evt-uuid" } }
{ "type": "REFRESH" }
```

Messages from widget → host:
```json
{ "type": "EVENT_CLICKED", "payload": { "eventId": "evt-uuid", "channel": "email" } }
{ "type": "WIDGET_LOADED" }
{ "type": "WIDGET_ERROR", "payload": { "code": "AUTH_FAILED", "message": "..." } }
```

---

## 8. Widget UI

### 8.1 Timeline View (`/timeline`)

- Chronological list, newest first
- Grouped by date
- Each item shows: channel icon, direction arrow, participant(s), subject/summary, timestamp, status badge
- Filter bar: channel pills, date range, direction toggle
- Infinite scroll or pagination

### 8.2 Detail View (`/events/:eventId`)

- Back button → returns to timeline
- Header: channel, direction, status, timestamp
- Participants list
- Content area (fetched on demand):
  - Email: subject + body (rendered HTML or plain text)
  - SMS: message content + delivery status
  - Call/VoIP: duration, outcome, recording player (streamed from source URL)
  - Physical mail: tracking info, scanned document link
- Attachments list (download links to source)
- Metadata section (collapsible)

### 8.3 Navigation

- Clicking any timeline item navigates to detail view inside iframe
- Host CRM receives `EVENT_CLICKED` message (optional deep integration)
- Browser back/forward works within iframe

---

## 9. Security

| Concern | Approach |
|---------|----------|
| Auth | JWT token passed from host; validated on every API call |
| Tenant isolation | All queries scoped by `tenantId` extracted from JWT |
| Iframe origin | Strict `postMessage` origin allowlist |
| Webhook auth | HMAC signature validation per source type |
| Credentials storage | Encrypted vault references, never plain text |
| Data access | Row-level tenant filtering; no cross-tenant leakage |
| PII | Masking rules configurable per tenant |
| Transport | TLS everywhere |

---

## 10. Deduplication & Idempotency

- Unique constraint: `(tenantId, source, externalId)`
- Webhook retries are safe (upsert on conflict)
- Generic ingest API returns 409 on duplicate
- Pull connectors track cursor/last-sync timestamp

---

## 11. Audit & Compliance

- Events are append-only (soft delete with `deletedAt` for legal holds)
- Every ingestion logged with source, timestamp, raw payload hash
- Retention policy configurable per tenant (auto-purge after N days)
- Export API: `GET /admin/export?entityId={id}&format=csv|json|pdf`

---

## 12. Deployment Model

```
┌─────────────────────────────────────────────────┐
│  Host CRM Page                                  │
│  ┌───────────────────────────────────────────┐  │
│  │  SDK (comm-timeline.js)                   │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  iframe: Widget App (React)         │  │  │
│  │  │  - Timeline View                    │  │  │
│  │  │  - Detail View                      │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │ API calls (JWT)
         ▼
┌─────────────────────────────────────────────────┐
│  Backend (Spring Boot)                          │
│  - Timeline API                                 │
│  - Event Detail API (+ on-demand source fetch)  │
│  - Webhook Receiver                             │
│  - Admin API                                    │
│  - Connector Scheduler                          │
└─────────────────────────────────────────────────┘
         │
         ▼
┌──────────────┐    ┌──────────────────────────┐
│  PostgreSQL  │    │  Source Systems           │
│  (metadata)  │    │  (Twilio, Gmail, CRM...) │
└──────────────┘    └──────────────────────────┘
```

---

## 13. Implementation Phases

### Phase 1 — Foundation (Weeks 1–2)
- [ ] Project scaffolding (Spring Boot + React + SDK)
- [ ] Database schema + migrations
- [ ] Timeline API + Event Detail API
- [ ] Widget UI with mock data (timeline + detail navigation)
- [ ] SDK mount/unmount + postMessage protocol

### Phase 2 — Ingestion (Weeks 3–4)
- [ ] Webhook receiver framework + signature validation
- [ ] Generic ingest API
- [ ] Source admin CRUD API
- [ ] First connector: Twilio SMS (webhook push)
- [ ] Second connector: Email via IMAP (pull)

### Phase 3 — Production Hardening (Weeks 5–6)
- [ ] JWT auth + tenant isolation
- [ ] Deduplication enforcement
- [ ] On-demand detail fetching from sources
- [ ] Error handling, retry logic
- [ ] Rate limiting

### Phase 4 — Packaging & Pilot (Week 7)
- [ ] SDK published to CDN/npm
- [ ] Integration guide for 1 CRM (e.g., HubSpot or Zoho)
- [ ] Admin config UI (optional)
- [ ] Export API
- [ ] Pilot deployment

### Phase 5 — Expand (Ongoing)
- [ ] Additional connectors (VoIP, physical mail, more CRMs)
- [ ] Theme customization
- [ ] Localization
- [ ] Analytics dashboard

---

## 14. Decisions (Resolved)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Hosting model | SaaS first, self-hosted later |
| 2 | Multi-tenant DB | Shared schema with row-level isolation |
| 3 | Detail content caching | Redis with short TTL (5 min) |
| 4 | SDK distribution | Both CDN + npm |
| 5 | Admin UI | API-only for v1, UI in v2 |
| 6 | Java version | 21 (virtual threads) |
| 7 | Build tool | Maven |
| 8 | Frontend package manager | npm |
| 9 | Repo structure | Monorepo |
| 10 | First connector (MVP) | Generic ingest API only |
| 11 | Database | PostgreSQL (upgrade to TimescaleDB if needed) |

---

## 15. Deployment

### Strategy
Dockerize everything; deployment topology decided later.

### Artifacts

| Component | Artifact | Details |
|-----------|----------|---------|
| Backend | Docker image | Java 21 + Spring Boot fat jar |
| Widget | Docker image | Nginx serving React production build |
| SDK | Static JS bundle | Bundled with widget or publishable to CDN separately |
| Database | PostgreSQL container | Official image, volume-mounted data |

### Local Development / Single-Host Deploy

```yaml
# docker-compose.yml provides:
- backend (Spring Boot, port 8080)
- widget (Nginx, port 3000)
- postgres (port 5432)
```

### Production-Ready Options (choose later)
- Single VM with docker-compose
- Kubernetes with separate deployments per service
- Backend on cloud container service + widget/SDK on CDN
- Managed DB (RDS/Cloud SQL) replacing local PostgreSQL container
