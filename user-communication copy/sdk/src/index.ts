export interface MountConfig {
  containerId: string;
  entityType: string;
  entityId: string;
  tenantId: string;
  token: string;
  baseUrl: string;
  widgetUrl?: string;
  theme?: 'light' | 'dark';
  locale?: string;
  onEventClick?: (event: { eventId: string; channel: string }) => void;
  onLoaded?: () => void;
  onError?: (error: { code: string; message: string }) => void;
}

export interface FilterConfig {
  channels?: string[];
  directions?: string[];
  dateFrom?: string;
  dateTo?: string;
}

const DEFAULT_WIDGET_URL = 'http://localhost:3000';

let iframe: HTMLIFrameElement | null = null;
let currentConfig: MountConfig | null = null;
let messageHandler: ((event: MessageEvent) => void) | null = null;

export function mount(config: MountConfig): void {
  if (iframe) {
    unmount();
  }

  currentConfig = config;
  const container = document.getElementById(config.containerId);
  if (!container) {
    throw new Error(`Container element #${config.containerId} not found`);
  }

  const widgetUrl = config.widgetUrl || DEFAULT_WIDGET_URL;

  iframe = document.createElement('iframe');
  iframe.src = widgetUrl;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '8px';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');

  messageHandler = (event: MessageEvent) => {
    if (event.source !== iframe?.contentWindow) return;
    handleWidgetMessage(event.data, config);
  };
  window.addEventListener('message', messageHandler);

  iframe.onload = () => {
    // Send config to widget once loaded
    sendToWidget({
      type: 'SET_CONFIG',
      payload: {
        entityType: config.entityType,
        entityId: config.entityId,
        tenantId: config.tenantId,
        baseUrl: config.baseUrl,
        token: config.token
      }
    });
  };

  container.innerHTML = '';
  container.appendChild(iframe);
}

export function unmount(): void {
  if (messageHandler) {
    window.removeEventListener('message', messageHandler);
    messageHandler = null;
  }
  if (iframe) {
    iframe.remove();
    iframe = null;
  }
  currentConfig = null;
}

export function setEntity(entityType: string, entityId: string): void {
  sendToWidget({ type: 'SET_ENTITY', payload: { entityType, entityId } });
}

export function refresh(): void {
  sendToWidget({ type: 'REFRESH' });
}

export function openEvent(eventId: string): void {
  sendToWidget({ type: 'OPEN_EVENT', payload: { eventId } });
}

export function setFilter(filter: FilterConfig): void {
  sendToWidget({ type: 'SET_FILTER', payload: filter });
}

export function destroy(): void {
  unmount();
}

function sendToWidget(message: unknown): void {
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(message, '*');
}

function handleWidgetMessage(data: Record<string, unknown>, config: MountConfig): void {
  if (!data || typeof data.type !== 'string') return;

  switch (data.type) {
    case 'WIDGET_LOADED':
      config.onLoaded?.();
      break;
    case 'EVENT_CLICKED':
      config.onEventClick?.(data.payload as { eventId: string; channel: string });
      break;
    case 'WIDGET_ERROR':
      config.onError?.(data.payload as { code: string; message: string });
      break;
  }
}
