import { z } from 'zod';
export const createFarmSchema = z.object({ body: z.object({ name: z.string().min(1) }), params: z.object({}), query: z.object({}) });
