import { z } from 'zod';
export const createTaskSchema = z.object({ body: z.object({ title: z.string().min(1), assignedToUserId: z.coerce.bigint() }), params: z.object({}), query: z.object({}) });
