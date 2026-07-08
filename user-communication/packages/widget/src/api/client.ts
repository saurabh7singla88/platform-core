import { TimelineEvent, FilterConfig } from '../types';

export interface TimelineResponse {
  items: TimelineEvent[];
  pagination: { page: number; size: number; total: number };
}

export class ApiClient {
  constructor(private baseUrl: string, private token: string) {}

  async getTimeline(
    entityType: string,
    entityId: string,
    filter: FilterConfig = {},
    page = 1,
    size = 25,
  ): Promise<TimelineResponse> {
    const params = new URLSearchParams({
      entityType,
      entityId,
      page: String(page),
      size: String(size),
    });
    if (filter.channels?.length) params.set('channels', filter.channels.join(','));
    if (filter.dateFrom) params.set('from', filter.dateFrom);
    if (filter.dateTo) params.set('to', filter.dateTo);

    const res = await fetch(`${this.baseUrl}/api/v1/timeline?${params}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!res.ok) throw new Error(`Timeline fetch failed: ${res.status}`);
    return res.json() as Promise<TimelineResponse>;
  }

  async getEvent(eventId: string): Promise<TimelineEvent> {
    const res = await fetch(`${this.baseUrl}/api/v1/events/${encodeURIComponent(eventId)}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    if (!res.ok) throw new Error(`Event fetch failed: ${res.status}`);
    return res.json() as Promise<TimelineEvent>;
  }
}
