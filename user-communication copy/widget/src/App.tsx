import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { TimelinePage } from './pages/TimelinePage';
import { EventDetailPage } from './pages/EventDetailPage';

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <div className="widget-container">
          <Routes>
            <Route path="/" element={<TimelinePage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
