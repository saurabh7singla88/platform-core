import { useEffect, useRef, useCallback } from 'react';
import { HostToWidgetMessage, WidgetToHostMessage } from '../types';

export function usePostMessage(
  onMessage: (msg: HostToWidgetMessage) => void,
  allowedOrigin?: string,
) {
  // Use ref so the event listener always calls the latest callback
  // without needing to re-subscribe on every render
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    function handler(event: MessageEvent) {
      if (allowedOrigin && event.origin !== allowedOrigin) return;
      if (!event.data || typeof event.data.type !== 'string') return;
      onMessageRef.current(event.data as HostToWidgetMessage);
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [allowedOrigin]);

  const sendToHost = useCallback(
    (msg: WidgetToHostMessage) => {
      window.parent.postMessage(msg, allowedOrigin ?? '*');
    },
    [allowedOrigin],
  );

  return { sendToHost };
}
