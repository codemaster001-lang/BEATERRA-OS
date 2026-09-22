import { z } from 'zod';
export const createVehicleSchema = z.object({ body: z.object({ registrationNumber: z.string().min(1), vehicleType: z.string().min(1), brand: z.string().min(1) }), params: z.object({}), query: z.object({}) });
