import { z } from 'zod';

export const vehicleTypeSchema = z.enum(['motorcycle', 'taxi', 'bus', 'truck']);

export const driverStatusSchema = z.enum(['active', 'inactive', 'suspended', 'on_leave']);

export const vehicleStatusSchema = z.enum(['available', 'assigned', 'maintenance', 'inactive', 'retired']);

export const vehicleQuerySchema = z.object({
  type: vehicleTypeSchema.optional(),
});

export const driverQuerySchema = z.object({
  type: vehicleTypeSchema.optional(),
});

export const createVehicleSchema = z.object({
  body: z.object({
    type: vehicleTypeSchema,
    registration_number: z.string().min(1),
    brand: z.string().min(1),
    model: z.string().optional().default(''),
    manufacture_year: z.coerce.number().int().min(1900).max(2200).optional(),
    status: vehicleStatusSchema.default('available'),
    acquisition_date: z.string().optional(),
    notes: z.string().optional(),
    driver_id: z.coerce.number().int().positive().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const createDriverSchema = z.object({
  body: z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    phone: z.string().min(1),
    license_number: z.string().min(1),
    license_category: z.string().min(1),
    license_expiry_date: z.string().optional(),
    hire_date: z.string().optional(),
    status: driverStatusSchema.default('active'),
    notes: z.string().optional(),
    vehicle_id: z.coerce.number().int().positive().optional(),
    vehicle_type: vehicleTypeSchema.optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateDriverStatusSchema = z.object({
  body: z.object({
    status: driverStatusSchema,
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const updateDriverSchema = z.object({
  body: z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    license_number: z.string().min(1).optional(),
    license_category: z.string().min(1).optional(),
    license_expiry_date: z.string().optional(),
    hire_date: z.string().optional(),
    status: driverStatusSchema.optional(),
    notes: z.string().optional(),
    vehicle_id: z.coerce.number().int().positive().optional(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});
