import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { ErrorCodes } from '../errors/error-codes.js';
export const authorize = (...permissions: string[]): RequestHandler => (request, _response, next) => {
  if (!request.auth) return next(new AppError(403, ErrorCodes.FORBIDDEN, 'Insufficient permissions'));
  if (!permissions.every((permission) => request.auth?.permissions.includes(permission))) {
    return next(new AppError(403, ErrorCodes.FORBIDDEN, 'Insufficient permissions'));
  }
  next();
};
