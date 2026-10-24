import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './app/app.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Raah: #root element is missing from index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the service worker for offline support in production builds only.
// If the service worker is unavailable, the app still works as a normal page.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* Offline support is a progressive enhancement; ignore registration errors. */
    });
  });
}
