import type { RequestHandler } from 'express';
/** Context-only middleware; persistence is performed by AuditService in domain transactions. */
export const auditContext: RequestHandler = (request, response, next) => { response.locals.auditContext = { requestId: request.id, userId: request.auth?.sub }; next(); };
