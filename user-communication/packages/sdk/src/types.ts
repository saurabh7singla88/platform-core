export type EntityType = 'contact' | 'lead' | 'account' | 'deal';
export type Channel = 'email' | 'sms' | 'call' | 'voip' | 'physical_mail' | 'note' | 'meeting';
export type Direction = 'inbound' | 'outbound' | 'internal';
export type Theme = 'light' | 'dark';

export interface MountConfig {
  /** ID of the host DOM element to inject the iframe into */
  containerId: string;
  entityType: EntityType;
  entityId: string;
  /** JWT passed to the widget for backend API calls */
  token: string;
  /** Base URL of the backend API, e.g. https://api.example.com */
  baseUrl: string;
  /** URL where the widget app is hosted. Defaults to http://localhost:3000 in dev. */
  widgetUrl?: string;
  theme?: Theme;
  locale?: string;
  onEventClick?: (event: { eventId: string; channel: Channel }) => void;
  onLoaded?: () => void;
  onError?: (error: { code: string; message: string }) => void;
}

export interface FilterConfig {
  channels?: Channel[];
  directions?: Direction[];
  dateFrom?: string;
  dateTo?: string;
}

export interface SDK {
  mount(config: MountConfig): void;
  unmount(): void;
  setEntity(entityType: EntityType, entityId: string): void;
  refresh(): void;
  openEvent(eventId: string): void;
  setFilter(filter: FilterConfig): void;
  destroy(): void;
}
