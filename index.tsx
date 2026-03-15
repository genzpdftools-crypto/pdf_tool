import { Buffer } from 'buffer';

// Browser mein Buffer ko global banana
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async'; // SEO ke liye naya import

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>    {/* App ko SEO provider ke andar wrap kiya */}
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
