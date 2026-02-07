import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';   // ← add this import
import './index.css';
import App from './App.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>           {/* ← wrap the App with BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>,
);