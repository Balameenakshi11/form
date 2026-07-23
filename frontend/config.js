// ============================================================
//  config.js — Yaazhlan Dance Studio API Configuration
// ============================================================

(function () {
  // 1. Check if a custom API URL is stored in localStorage
  const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('YAAZHLAN_API_URL') : null;

  // 2. Production Railway Backend API URL
  const RAILWAY_BACKEND_URL = 'https://form-production-47a9.up.railway.app/api';

  // 3. Detect if running locally or deployed on Netlify/Cloud
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === ''
  );

  // Set global API_BASE_URL
  window.API_BASE_URL = storedUrl || (isLocalhost ? 'http://localhost:5000/api' : RAILWAY_BACKEND_URL);

  console.log('📡 Yaazhlan API Base URL initialized:', window.API_BASE_URL);
})();
