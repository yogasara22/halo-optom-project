// constants/config.ts

// API Configuration
// export const API_BASE_URL = 'http://localhost:4000/api';

// Gunakan IP lokal untuk pengujian di perangkat fisik
export const API_BASE_URL = 'http://192.168.11.193:4000/api';

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