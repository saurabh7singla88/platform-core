# CRM Communication Timeline SDK

A plug-and-play, CRM-agnostic communication timeline widget. Embeds via iframe into any CRM to show a unified trail of all user communications (email, SMS, calls, VoIP, physical mail).

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 21 (for local backend dev)
- Node.js 20+ (for widget/SDK dev)

### Run Everything with Docker

```bash
docker compose up --build
```

This starts:
- **Backend API** → http://localhost:8080
- **Widget** → http://localhost:3000
- **PostgreSQL** → localhost:5432

### Embed in Your CRM

```html
<script src="https://cdn.yourwidget.com/sdk/v1/comm-timeline-sdk.js"></script>
<div id="timeline-container" style="width:400px; height:600px;"></div>
<script>
  CRMCommTimeline.mount({
    containerId: 'timeline-container',
    entityType: 'contact',
    entityId: '12345',
    tenantId: 'your-tenant',
    token: 'your-jwt-token',
    baseUrl: 'https://api.yourwidget.com',
    onEventClick: function(event) {
      console.log('User clicked:', event.eventId);
    }
  });
</script>
```

## Ingest Events

Push communication events via the generic ingest API:

```bash
curl -X POST http://localhost:8080/api/v1/ingest/events \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: tenant-demo" \
  -d '{
    "entityType": "contact",
    "entityId": "contact-001",
    "channel": "email",
    "direction": "inbound",
    "status": "completed",
    "timestamp": "2026-07-06T10:30:00Z",
    "subject": "Re: Contract renewal",
    "summary": "Client confirmed renewal for next quarter",
    "source": "gmail",
    "externalId": "msg-abc-123",
    "participants": [
      {"type": "from", "identifier": "john@example.com", "name": "John Doe"},
      {"type": "to", "identifier": "sales@yourcompany.com", "name": "Sales Team"}
    ]
  }'
```

## Project Structure

```
user-communication/
├── backend/          # Spring Boot API (Java 21)
├── widget/           # React timeline UI (iframe content)
├── sdk/              # Host SDK (JS/TS, mounts iframe)
├── demo/             # Demo host page showing SDK integration
├── docker-compose.yml
└── SPEC.md           # Full product specification
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/timeline` | Fetch paginated timeline for an entity |
| GET | `/api/v1/events/{id}` | Get event details |
| POST | `/api/v1/ingest/events` | Ingest a new communication event |

## Local Development

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Widget
```bash
cd widget
npm install
npm run dev
```

### SDK
```bash
cd sdk
npm install
npm run build
```
