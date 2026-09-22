import type { Response } from 'express';
export const ok = <T>(response: Response, data: T, statusCode = 200) => response.status(statusCode).json({ data });
