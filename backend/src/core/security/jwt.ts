import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../errors/app-error.js';
import { ErrorCodes } from '../errors/error-codes.js';

export type AccessTokenPayload = { sub: string; roleId: string; permissions: string[] };

function accessSecret(): string {
  if (!env.JWT_ACCESS_SECRET) throw new AppError(500, ErrorCodes.CONFIGURATION_ERROR, 'JWT_ACCESS_SECRET is not configured');
  return env.JWT_ACCESS_SECRET;
}

export const signAccessToken = (payload: AccessTokenPayload) => jwt.sign(payload, accessSecret(), { expiresIn: '15m' });
export const verifyAccessToken = (token: string) => jwt.verify(token, accessSecret()) as AccessTokenPayload;
