import type { CorsOptions } from 'cors';
import { env } from './env.js';

const allowedOrigins = new Set([
  ...env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean),
  'http://localhost:5173',
  'http://localhost:5174',
]);

export const corsOptions: CorsOptions = {
  origin: (requestOrigin, callback) => {
    if (!requestOrigin || allowedOrigins.has(requestOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
};
