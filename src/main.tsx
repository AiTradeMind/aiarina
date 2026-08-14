import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './AppShell';
import './index.css';
import { QueryProvider } from './lib/QueryProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </StrictMode>,
);
