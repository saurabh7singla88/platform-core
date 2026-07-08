import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { TimelineView } from './views/TimelineView';
import { DetailView } from './views/DetailView';
import { usePostMessage } from './hooks/usePostMessage';
import { HostToWidgetMessage, FilterConfig, WidgetConfig, EntityType } from './types';
import { mockEvents } from './mockData';

function WidgetApp() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [filter, setFilter] = useState<FilterConfig>({});
  // entityType / entityId reserved for Phase 2 real API calls
  const [_entityType, setEntityType] = useState<EntityType>('contact');
  const [_entityId, setEntityId] = useState<string>('contact-123');

  const onMessage = useCallback(
    (msg: HostToWidgetMessage) => {
      switch (msg.type) {
        case 'INIT':
          setConfig(msg.payload);
          setEntityType(msg.payload.entityType);
          setEntityId(msg.payload.entityId);
          break;
        case 'SET_ENTITY':
          setEntityType(msg.payload.entityType);
          setEntityId(msg.payload.entityId);
          navigate('/');
          break;
        case 'SET_FILTER':
          setFilter(msg.payload);
          break;
        case 'OPEN_EVENT':
          navigate(`/events/${msg.payload.eventId}`);
          break;
        case 'REFRESH':
          navigate('/');
          break;
      }
    },
    [navigate],
  );

  const { sendToHost } = usePostMessage(onMessage, config?.allowedOrigin);

  // Signal to host that the widget is ready
  useEffect(() => {
    sendToHost({ type: 'WIDGET_LOADED' });
  }, [sendToHost]);

  return (
    <div style={{ height: '100%', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '14px' }}>
      <Routes>
        <Route
          path="/"
          element={
            <TimelineView
              events={mockEvents}
              filter={filter}
              onFilterChange={setFilter}
              onEventClick={(evt) => {
                sendToHost({ type: 'EVENT_CLICKED', payload: { eventId: evt.id, channel: evt.channel } });
                navigate(`/events/${evt.id}`);
              }}
            />
          }
        />
        <Route
          path="/events/:eventId"
          element={
            <DetailView
              events={mockEvents}
              onBack={() => navigate('/')}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WidgetApp />
    </BrowserRouter>
  );
}
