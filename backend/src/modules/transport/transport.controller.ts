import type { Request, Response } from 'express';
import { ok } from '../../core/utils/api-response.js';
import { createDriverSchema, createVehicleSchema, driverQuerySchema, updateDriverSchema, updateDriverStatusSchema, vehicleQuerySchema } from './transport.schemas.js';
import { TransportService } from './transport.service.js';

const service = new TransportService();

export class TransportController {
  async listSummary(_request: Request, response: Response) {
    return ok(response, await service.listSummary());
  }

  async listDrivers(request: Request, response: Response) {
    const query = driverQuerySchema.parse(request.query);
    return ok(response, await service.listDrivers(query.type));
  }

  async listVehicles(request: Request, response: Response) {
    const query = vehicleQuerySchema.parse(request.query);
    return ok(response, await service.listVehicles(query.type));
  }

  async createDriver(request: Request, response: Response) {
    const body = createDriverSchema.parse({
      body: request.body,
      params: request.params,
      query: request.query,
    });
    const driver = await service.createDriver({
      firstName: body.body.first_name,
      lastName: body.body.last_name,
      phone: body.body.phone,
      licenseNumber: body.body.license_number,
      licenseCategory: body.body.license_category,
      licenseExpiryDate: body.body.license_expiry_date,
      hireDate: body.body.hire_date,
      status: body.body.status,
      notes: body.body.notes,
      vehicleId: body.body.vehicle_id,
      vehicleType: body.body.vehicle_type,
    });

    return ok(response, driver, 201);
  }

  async createVehicle(request: Request, response: Response) {
    const body = createVehicleSchema.parse({
      body: request.body,
      params: request.params,
      query: request.query,
    });
    const vehicle = await service.createVehicle({
      type: body.body.type,
      registrationNumber: body.body.registration_number,
      brand: body.body.brand,
      model: body.body.model,
      manufactureYear: body.body.manufacture_year,
      status: body.body.status,
      acquisitionDate: body.body.acquisition_date,
      notes: body.body.notes,
      driverId: body.body.driver_id,
    });

    return ok(response, vehicle, 201);
  }

  async updateDriverStatus(request: Request, response: Response) {
    const body = updateDriverStatusSchema.parse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    const updated = await service.updateDriverStatus(body.params.id, body.body.status);
    return ok(response, { updated });
  }

  async updateDriver(request: Request, response: Response) {
    const body = updateDriverSchema.parse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    const updated = await service.updateDriver(body.params.id, {
      firstName: body.body.first_name,
      lastName: body.body.last_name,
      phone: body.body.phone,
      licenseNumber: body.body.license_number,
      licenseCategory: body.body.license_category,
      licenseExpiryDate: body.body.license_expiry_date,
      hireDate: body.body.hire_date,
      status: body.body.status,
      notes: body.body.notes,
      vehicleId: body.body.vehicle_id,
    });

    return ok(response, { updated });
  }
}
