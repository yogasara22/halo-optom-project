// constants/config.ts

// API Configuration
// Gunakan ngrok untuk URL yang stabil (tidak berubah meskipun IP lokal berubah)
export const API_BASE_URL = 'https://mallory-nonevidential-unhumourously.ngrok-free.dev/api';

// Alternatif: gunakan IP lokal (akan berubah jika ganti WiFi)
// export const API_BASE_URL = 'http://10.23.75.39:4000/api';

// App Configuration
export const APP_NAME = 'Halo Optom';
export const APP_VERSION = '1.0.0';

// Feature Flags
export const FEATURES = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_ANALYTICS: true,
};

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 15000, // 15 seconds
  SESSION: 3600000, // 1 hour
};