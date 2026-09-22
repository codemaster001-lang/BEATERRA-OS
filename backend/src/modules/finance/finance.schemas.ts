import { z } from 'zod';
export const createTransactionSchema = z.object({ body: z.object({ accountId: z.coerce.bigint(), amount: z.coerce.number().positive(), transactionDate: z.string().date() }), params: z.object({}), query: z.object({}) });
