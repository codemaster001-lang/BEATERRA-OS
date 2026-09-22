import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { logger } from '../../config/logger.js';
import { AppError } from './app-error.js';
import { ErrorCodes } from './error-codes.js';

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  void _next;
  if (error instanceof ZodError) {
    response.status(400).json({ error: { code: ErrorCodes.VALIDATION_ERROR, details: error.flatten() } });
    return;
  }
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: { code: error.code, message: error.message, details: error.details } });
    return;
  }
  if (error instanceof multer.MulterError) {
    response.status(400).json({
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: error.code === 'LIMIT_FILE_SIZE' ? 'Plan file exceeds the 25 MB limit' : error.message,
      },
    });
    return;
  }
  logger.error({ err: error, requestId: request.id }, 'Unhandled request error');
  response.status(500).json({ error: { code: ErrorCodes.INTERNAL_ERROR, message: 'Internal server error' } });
};
