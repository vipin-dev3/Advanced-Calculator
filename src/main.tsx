import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppContent } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';
import { HistoryProvider } from './context/HistoryContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <SoundProvider>
        <HistoryProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </HistoryProvider>
      </SoundProvider>
    </ThemeProvider>
  </React.StrictMode>
);
