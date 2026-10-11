import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackTitle="Medical AI Root System Guard">
    <App />
  </ErrorBoundary>
);
