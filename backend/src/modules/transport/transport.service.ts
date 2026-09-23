import { TransportRepository, type TransportVehicleType } from './transport.repository.js';

const categoryLabels: Record<TransportVehicleType, string> = {
  motorcycle: 'Moto',
  taxi: 'Taxi',
  bus: 'Bus',
  truck: 'Camion',
};

export class TransportService {
  constructor(private readonly repository = new TransportRepository()) {}

  async listSummary() {
    const rows = await this.repository.listSummary();

    return (['motorcycle', 'taxi', 'bus', 'truck'] as TransportVehicleType[]).map((type) => {
      const row = rows.find((entry) => entry.type === type);
      return {
        type,
        label: categoryLabels[type],
        total: Number(row?.total ?? 0),
        available: Number(row?.available ?? 0),
        assigned: Number(row?.assigned ?? 0),
        maintenance: Number(row?.maintenance ?? 0),
      };
    });
  }

  async listDrivers(type?: TransportVehicleType) {
    const rows = await this.repository.listDrivers(type);

    return rows.map((row) => ({
      id: row.id,
      driver_code: row.driver_code ?? `CH-${String(row.id).padStart(4, '0')}`,
      first_name: row.first_name,
      last_name: row.last_name,
      full_name: `${row.first_name} ${row.last_name}`.trim(),
      phone: row.phone,
      license_number: row.license_number,
      license_category: row.license_category ?? 'B',
      license_expiry_date: row.license_expiry_date,
      hire_date: row.hire_date,
      status: row.status,
      notes: row.notes ?? '',
      vehicle_id: row.vehicle_id,
      vehicle_type: row.vehicle_type ?? type ?? null,
      registration_number: row.registration_number ?? '',
      brand: row.brand ?? '',
      model: row.model ?? '',
      vehicle_status: row.vehicle_status ?? 'inactive',
      created_at: row.created_at,
    }));
  }

  async listVehicles(type?: TransportVehicleType) {
    const rows = await this.repository.listVehicles(type);

    return rows.map((row) => ({
      id: row.id,
      type: row.vehicle_type,
      registration_number: row.registration_number,
      brand: row.brand,
      model: row.model ?? '',
      manufacture_year: row.manufacture_year,
      status: row.status,
      acquisition_date: row.acquisition_date,
      notes: row.notes ?? '',
      driver_id: row.driver_id,
      driver_name: row.driver_name ?? '',
    }));
  }

  async createVehicle(input: {
    type: TransportVehicleType;
    registrationNumber: string;
    brand: string;
    model?: string;
    manufactureYear?: number;
    status: string;
    acquisitionDate?: string;
    notes?: string;
    driverId?: number;
  }) {
    const id = await this.repository.createVehicle({
      type: input.type,
      registrationNumber: input.registrationNumber,
      brand: input.brand,
      model: input.model,
      manufactureYear: input.manufactureYear,
      status: input.status,
      acquisitionDate: input.acquisitionDate,
      notes: input.notes,
      driverId: input.driverId,
    });

    return this.repository.listVehicles(input.type).then((vehicles) => vehicles.find((vehicle) => vehicle.id === id));
  }

  async createDriver(input: {
    firstName: string;
    lastName: string;
    phone: string;
    licenseNumber: string;
    licenseCategory: string;
    licenseExpiryDate?: string;
    hireDate?: string;
    status: string;
    notes?: string;
    vehicleId?: number;
    vehicleType?: TransportVehicleType;
  }) {
    const id = await this.repository.createDriver({
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      licenseNumber: input.licenseNumber,
      licenseCategory: input.licenseCategory,
      licenseExpiryDate: input.licenseExpiryDate,
      hireDate: input.hireDate,
      status: input.status,
      notes: input.notes,
      vehicleId: input.vehicleId,
      vehicleType: input.vehicleType,
    });

    const drivers = await this.repository.listDrivers(input.vehicleType);
    return drivers.find((driver) => driver.id === id) ?? {
      id,
      driver_code: `CH-${String(id).padStart(4, '0')}`,
      first_name: input.firstName,
      last_name: input.lastName,
      full_name: `${input.firstName} ${input.lastName}`.trim(),
      phone: input.phone,
      license_number: input.licenseNumber,
      license_category: input.licenseCategory,
      status: input.status,
      notes: input.notes ?? '',
      vehicle_id: input.vehicleId ?? null,
      vehicle_type: input.vehicleType ?? null,
      registration_number: '',
      brand: '',
      model: '',
      vehicle_status: 'inactive',
    };
  }

  async updateDriverStatus(id: number, status: string) {
    return this.repository.updateDriverStatus(id, status);
  }

  async updateDriver(id: number, input: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    licenseNumber?: string;
    licenseCategory?: string;
    licenseExpiryDate?: string;
    hireDate?: string;
    status?: string;
    notes?: string;
    vehicleId?: number;
  }) {
    const updated = await this.repository.updateDriver(id, input);
    if (!updated) {
      return null;
    }

    const drivers = await this.repository.listDrivers();
    return drivers.find((driver) => driver.id === id) ?? null;
  }
}
