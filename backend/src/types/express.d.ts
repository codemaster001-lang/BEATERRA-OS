import type { AccessTokenPayload } from '../core/security/jwt.js';
declare global { namespace Express { interface Request { id: string; auth?: AccessTokenPayload; } } }
export {};
