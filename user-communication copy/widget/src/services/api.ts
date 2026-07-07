import { TimelineResponse, EventDetail, WidgetConfig } from '../types';

let config: WidgetConfig | null = null;

export function setApiConfig(cfg: WidgetConfig) {
  config = cfg;
}

function getHeaders(): HeadersInit {
  if (!config) throw new Error('API not configured');
  return {
    'Content-Type': 'application/json',
    'X-Tenant-Id': config.tenantId,
    'Authorization': `Bearer ${config.token}`
  };
}

function baseUrl(): string {
  if (!config) throw new Error('API not configured');
  return config.baseUrl;
}

export async function fetchTimeline(params: {
  entityType: string;
  entityId: string;
  channels?: string[];
  directions?: string[];
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}): Promise<TimelineResponse> {
  const url = new URL(`${baseUrl()}/api/v1/timeline`);
  url.searchParams.set('entityType', params.entityType);
  url.searchParams.set('entityId', params.entityId);
  if (params.channels?.length) url.searchParams.set('channels', params.channels.join(','));
  if (params.directions?.length) url.searchParams.set('directions', params.directions.join(','));
  if (params.from) url.searchParams.set('from', params.from);
  if (params.to) url.searchParams.set('to', params.to);
  url.searchParams.set('page', String(params.page ?? 0));
  url.searchParams.set('size', String(params.size ?? 25));

  const res = await fetch(url.toString(), { headers: getHeaders() });
  if (!res.ok) throw new Error(`Timeline fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchEventDetail(eventId: string): Promise<EventDetail> {
  const res = await fetch(`${baseUrl()}/api/v1/events/${eventId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Event detail fetch failed: ${res.status}`);
  return res.json();
}
