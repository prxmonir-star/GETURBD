import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-register service worker for PWA support
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New FF PRO version available.');
  },
  onOfflineReady() {
    console.log('FF PRO is offline ready.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
