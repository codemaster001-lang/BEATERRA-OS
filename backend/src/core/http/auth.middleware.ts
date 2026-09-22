import type { RequestHandler } from 'express';
import { AppError } from '../errors/app-error.js';
import { ErrorCodes } from '../errors/error-codes.js';
import { verifyAccessToken } from '../security/jwt.js';

export const authenticate: RequestHandler = (request, _response, next) => {
  const token = request.header('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required'));
  try { request.auth = verifyAccessToken(token); next(); } catch { next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid or expired token')); }
};
