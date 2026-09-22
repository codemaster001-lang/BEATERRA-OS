import { Router } from 'express';
import { env } from '../config/env.js';
export const healthRouter = Router();
healthRouter.get('/health', (_request, response) => response.status(200).json({ status: 'ok', service: 'beaterra-os-api', environment: env.NODE_ENV }));
