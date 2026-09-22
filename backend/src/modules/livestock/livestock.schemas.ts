import { z } from 'zod';
export const createAnimalSchema = z.object({ body: z.object({ animalTag: z.string().min(1), species: z.string().min(1) }), params: z.object({}), query: z.object({}) });
