import React, { createContext, useContext, useState, useEffect } from 'react';
import { WidgetConfig } from '../types';
import { setApiConfig } from '../services/api';

const ConfigContext = createContext<WidgetConfig | null>(null);

export function useWidgetConfig() {
  return useContext(ConfigContext);
}

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const { data } = event;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'SET_CONFIG' || data.type === 'SET_ENTITY') {
        const newConfig: WidgetConfig = {
          entityType: data.payload.entityType,
          entityId: data.payload.entityId,
          tenantId: data.payload.tenantId,
          baseUrl: data.payload.baseUrl,
          token: data.payload.token
        };
        setConfig(newConfig);
        setApiConfig(newConfig);
      }
    }

    window.addEventListener('message', handleMessage);

    // Notify host that widget is ready
    window.parent.postMessage({ type: 'WIDGET_LOADED' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};
