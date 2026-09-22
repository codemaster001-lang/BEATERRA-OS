import { z } from 'zod';
export const createUserSchema = z.object({ body: z.object({ firstName: z.string().min(1), lastName: z.string().min(1), email: z.string().email(), roleId: z.coerce.bigint() }), params: z.object({}), query: z.object({}) });
