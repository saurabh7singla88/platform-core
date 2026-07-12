import { useEffect, RefObject } from 'react';
import { WidgetToHostMessage } from '../types';

/**
 * Observes content height changes and posts RESIZE messages to the host SDK.
 * The host uses this to auto-resize the iframe to avoid scrollbars.
 */
export function useAutoResize(
  ref: RefObject<HTMLElement | null>,
  sendToHost: (msg: WidgetToHostMessage) => void,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let lastHeight = 0;

    function reportHeight() {
      const height = el!.scrollHeight;
      if (height !== lastHeight) {
        lastHeight = height;
        sendToHost({ type: 'RESIZE', payload: { height } });
      }
    }

    // Initial report
    reportHeight();

    // Observe DOM mutations that may change height
    const observer = new ResizeObserver(() => reportHeight());
    observer.observe(el);

    return () => observer.disconnect();
  }, [ref, sendToHost]);
}
