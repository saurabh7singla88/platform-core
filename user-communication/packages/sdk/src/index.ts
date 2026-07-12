import { MountConfig, FilterConfig, EntityType, Channel, SDK } from './types';

type WidgetMessage =
  | { type: 'WIDGET_LOADED' }
  | { type: 'EVENT_CLICKED'; payload: { eventId: string; channel: Channel } }
  | { type: 'WIDGET_ERROR'; payload: { code: string; message: string } }
  | { type: 'RESIZE'; payload: { height: number } }
  | { type: 'TOKEN_REQUEST' };

class CRMCommTimelineInstance implements SDK {
  private iframe: HTMLIFrameElement | null = null;
  private config: MountConfig | null = null;
  private widgetOrigin: string | null = null;
  private ready = false;
  private pendingMessages: unknown[] = [];
  private listener: ((e: MessageEvent) => void) | null = null;

  mount(config: MountConfig): void {
    if (this.iframe) this.destroy();

    const container = document.getElementById(config.containerId);
    if (!container) {
      console.error(`[CRMCommTimeline] Container #${config.containerId} not found`);
      return;
    }

    this.config = config;
    const widgetUrl = config.widgetUrl ?? 'http://localhost:3000';
    this.widgetOrigin = new URL(widgetUrl).origin;

    const iframe = document.createElement('iframe');
    iframe.src = widgetUrl;
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
    iframe.setAttribute('title', 'Communication Timeline');
    // Allow scripts; allow-same-origin needed for postMessage to work cross-origin
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
    container.appendChild(iframe);
    this.iframe = iframe;

    this.listener = (event: MessageEvent) => {
      if (event.origin !== this.widgetOrigin) return;
      if (!event.data || typeof event.data.type !== 'string') return;
      this.handleWidgetMessage(event.data as WidgetMessage);
    };
    window.addEventListener('message', this.listener);
  }

  private async handleWidgetMessage(msg: WidgetMessage): Promise<void> {
    switch (msg.type) {
      case 'WIDGET_LOADED':
        this.ready = true;
        // Resolve token (static or via callback)
        const token = await this.resolveToken();
        // Send initial config
        this.iframe?.contentWindow?.postMessage({
          type: 'INIT',
          payload: {
            entityType: this.config!.entityType,
            entityId: this.config!.entityId,
            token,
            baseUrl: this.config!.baseUrl,
            theme: this.config!.theme ?? 'light',
            locale: this.config!.locale,
            allowedOrigin: window.location.origin,
          },
        }, this.widgetOrigin!);
        // Flush buffered messages
        for (const m of this.pendingMessages) {
          this.iframe?.contentWindow?.postMessage(m, this.widgetOrigin!);
        }
        this.pendingMessages = [];
        this.config?.onLoaded?.();
        break;

      case 'EVENT_CLICKED':
        this.config?.onEventClick?.(msg.payload);
        break;

      case 'WIDGET_ERROR':
        this.config?.onError?.(msg.payload);
        break;

      case 'RESIZE':
        if (this.config?.autoResize && this.iframe) {
          this.iframe.style.height = `${msg.payload.height}px`;
        }
        break;

      case 'TOKEN_REQUEST': {
        const refreshedToken = await this.resolveToken();
        if (refreshedToken) {
          this.iframe?.contentWindow?.postMessage(
            { type: 'TOKEN_REFRESH', payload: { token: refreshedToken } },
            this.widgetOrigin!,
          );
        }
        break;
      }
    }
  }

  private async resolveToken(): Promise<string> {
    if (this.config?.getToken) {
      try {
        return await this.config.getToken();
      } catch (err) {
        this.config?.onError?.({ code: 'TOKEN_REFRESH_FAILED', message: String(err) });
        return '';
      }
    }
    return this.config?.token ?? '';
  }

  private send(msg: unknown): void {
    if (!this.iframe?.contentWindow || !this.widgetOrigin) return;
    if (!this.ready) {
      this.pendingMessages.push(msg);
      return;
    }
    this.iframe.contentWindow.postMessage(msg, this.widgetOrigin);
  }

  unmount(): void {
    this.iframe?.remove();
    this.iframe = null;
    this.ready = false;
  }

  setEntity(entityType: EntityType, entityId: string): void {
    this.send({ type: 'SET_ENTITY', payload: { entityType, entityId } });
  }

  refresh(): void {
    this.send({ type: 'REFRESH' });
  }

  openEvent(eventId: string): void {
    this.send({ type: 'OPEN_EVENT', payload: { eventId } });
  }

  setFilter(filter: FilterConfig): void {
    this.send({ type: 'SET_FILTER', payload: filter });
  }

  destroy(): void {
    if (this.listener) {
      window.removeEventListener('message', this.listener);
      this.listener = null;
    }
    this.unmount();
    this.config = null;
    this.widgetOrigin = null;
    this.pendingMessages = [];
  }
}

const CRMCommTimeline = new CRMCommTimelineInstance();

// Process any calls queued before the SDK loaded (async loader pattern)
// Hosts can do: window.CRMCommTimeline = window.CRMCommTimeline || { q: [] };
// then push calls: window.CRMCommTimeline.q.push(['mount', { ... }]);
if (typeof window !== 'undefined') {
  const prev = (window as unknown as Record<string, unknown>).CRMCommTimeline as
    | { q?: Array<[string, ...unknown[]]> }
    | undefined;
  if (prev?.q && Array.isArray(prev.q)) {
    for (const [method, ...args] of prev.q) {
      if (typeof (CRMCommTimeline as unknown as Record<string, unknown>)[method] === 'function') {
        (CRMCommTimeline as unknown as Record<string, (...a: unknown[]) => void>)[method](...args);
      }
    }
  }
  (window as unknown as Record<string, unknown>).CRMCommTimeline = CRMCommTimeline;
}

export default CRMCommTimeline;
export { CRMCommTimeline };
export type { MountConfig, FilterConfig, SDK } from './types';
