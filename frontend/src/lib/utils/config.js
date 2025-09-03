/**
 * Application configuration and environment variable validation
 */

// Validate required environment variables
const requiredEnvVars = {
  VITE_API_URL: 'http://localhost:5000' // Hardcoded for now
};
console.log(requiredEnvVars);
// Validate API URL format
const validateApiUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!validateApiUrl(requiredEnvVars.VITE_API_URL)) {
  console.warn('Invalid VITE_API_URL format. Using default: http://localhost:5000');
  requiredEnvVars.VITE_API_URL = 'http://localhost:5000';
}

export const config = {
      api: {
      baseURL: `${requiredEnvVars.VITE_API_URL}/api`
    },
  app: {
    name: 'TrackNest Pro',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development'
  },
  features: {
    enableNotifications: true,
    enablePrinting: true,
    enableExport: true
  }
};

export default config;
