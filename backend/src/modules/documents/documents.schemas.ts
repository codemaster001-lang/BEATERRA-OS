import { z } from 'zod';
export const createDocumentSchema = z.object({ body: z.object({ name: z.string().min(1), mimeType: z.string().min(1) }), params: z.object({}), query: z.object({}) });
