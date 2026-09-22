import { z } from 'zod';

export const plansQuerySchema = z.object({
  projectId: z.coerce.number().int().positive().optional(),
});

export const importPlanBodySchema = z.object({
  project_id: z.coerce.number().int().positive(),
  plan_type: z.enum(['architectural', 'structural', 'electrical', 'plumbing', 'other']).default('other'),
  version: z.string().trim().max(50).optional(),
});
