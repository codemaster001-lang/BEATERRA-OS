import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getDatabasePool, withTransaction } from '../../core/database/mysql.pool.js';

export type TransportVehicleType = 'motorcycle' | 'taxi' | 'bus' | 'truck';

export type TransportSummaryRow = RowDataPacket & {
  type: TransportVehicleType;
  total: number;
  available: number;
  assigned: number;
  maintenance: number;
};

export type DriverRow = RowDataPacket & {
  id: number;
  driver_code: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  license_number: string;
  license_category: string | null;
  license_expiry_date: string | null;
  hire_date: string | null;
  status: string;
  notes: string | null;
  vehicle_id: number | null;
  vehicle_type: string | null;
  registration_number: string | null;
  brand: string | null;
  model: string | null;
  vehicle_status: string | null;
  created_at: string;
};

export type VehicleRow = RowDataPacket & {
  id: number;
  registration_number: string;
  vehicle_type: string;
  brand: string;
  model: string | null;
  manufacture_year: number | null;
  status: string;
  acquisition_date: string | null;
  notes: string | null;
  driver_id: number | null;
  driver_name: string | null;
};

export class TransportRepository {
  async listSummary(): Promise<TransportSummaryRow[]> {
    const [rows] = await getDatabasePool().execute<TransportSummaryRow[]>(`
      SELECT
        vehicle_type AS type,
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) AS assigned,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance
      FROM vehicles
      WHERE vehicle_type IN ('motorcycle', 'taxi', 'bus', 'truck')
      GROUP BY vehicle_type
      ORDER BY FIELD(vehicle_type, 'motorcycle', 'taxi', 'bus', 'truck')
    `);

    return rows;
  }

  async listDrivers(type?: TransportVehicleType): Promise<DriverRow[]> {
    const [rows] = await getDatabasePool().execute<DriverRow[]>(`
      SELECT
        d.id,
        COALESCE(d.driver_code, CONCAT('CH-', LPAD(CAST(d.id AS CHAR), 4, '0'))) AS driver_code,
        d.first_name,
        d.last_name,
        d.phone,
        d.license_number,
        d.license_category,
        d.license_expiry_date,
        d.hire_date,
        d.status,
        d.notes,
        v.id AS vehicle_id,
        v.vehicle_type,
        v.registration_number,
        v.brand,
        v.model,
        v.status AS vehicle_status,
        d.created_at
      FROM drivers d
      LEFT JOIN vehicle_assignments va
        ON va.driver_id = d.id AND va.status = 'active'
      LEFT JOIN vehicles v
        ON v.id = va.vehicle_id
      WHERE (? IS NULL OR v.vehicle_type = ?)
      ORDER BY d.created_at DESC, d.id DESC
    `, [type ?? null, type ?? null]);

    return rows;
  }

  async listVehicles(type?: TransportVehicleType): Promise<VehicleRow[]> {
    const [rows] = await getDatabasePool().execute<VehicleRow[]>(`
      SELECT
        v.id,
        v.registration_number,
        v.vehicle_type,
        v.brand,
        v.model,
        v.manufacture_year,
        v.status,
        v.acquisition_date,
        v.notes,
        va.driver_id,
        CONCAT(d.first_name, ' ', d.last_name) AS driver_name
      FROM vehicles v
      LEFT JOIN vehicle_assignments va
        ON va.vehicle_id = v.id AND va.status = 'active'
      LEFT JOIN drivers d
        ON d.id = va.driver_id
      WHERE (? IS NULL OR v.vehicle_type = ?)
      ORDER BY v.created_at DESC, v.id DESC
    `, [type ?? null, type ?? null]);

    return rows;
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
  }): Promise<number> {
    const [result] = await getDatabasePool().execute<ResultSetHeader>(`
      INSERT INTO vehicles (
        registration_number,
        vehicle_type,
        brand,
        model,
        manufacture_year,
        status,
        acquisition_date,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      input.registrationNumber,
      input.type,
      input.brand,
      input.model ?? null,
      input.manufactureYear ?? null,
      input.status,
      input.acquisitionDate ?? null,
      input.notes ?? null,
    ]);

    const vehicleId = result.insertId;

    if (input.driverId) {
      const [assignmentResult] = await getDatabasePool().execute<ResultSetHeader>(`
        INSERT INTO vehicle_assignments (vehicle_id, driver_id, starts_at, status)
        VALUES (?, ?, NOW(), 'active')
      `, [vehicleId, input.driverId]);

      if (assignmentResult.insertId) {
        await getDatabasePool().execute(`
          UPDATE vehicles
          SET status = 'assigned'
          WHERE id = ?
        `, [vehicleId]);
      }
    }

    return vehicleId;
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
  }): Promise<number> {
    return withTransaction(async (connection) => {
      const [result] = await connection.execute<ResultSetHeader>(`
        INSERT INTO drivers (
          first_name,
          last_name,
          phone,
          license_number,
          license_category,
          license_expiry_date,
          hire_date,
          status,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        input.firstName,
        input.lastName,
        input.phone,
        input.licenseNumber,
        input.licenseCategory,
        input.licenseExpiryDate ?? null,
        input.hireDate ?? null,
        input.status,
        input.notes ?? null,
      ]);

      const driverId = result.insertId;
      const generatedCode = `CH-${String(driverId).padStart(4, '0')}`;

      await connection.execute(
        'UPDATE drivers SET driver_code = ? WHERE id = ?',
        [generatedCode, driverId],
      );

      if (input.vehicleId) {
        await connection.execute(
          `UPDATE vehicle_assignments
           SET status = 'completed', ends_at = NOW()
           WHERE driver_id = ? AND status = 'active'`,
          [driverId],
        );

        await connection.execute(
          `INSERT INTO vehicle_assignments (vehicle_id, driver_id, starts_at, status)
           VALUES (?, ?, NOW(), 'active')`,
          [input.vehicleId, driverId],
        );

        await connection.execute(
          `UPDATE vehicles SET status = 'assigned' WHERE id = ?`,
          [input.vehicleId],
        );
      }

      return driverId;
    });
  }

  async updateDriverStatus(id: number, status: string): Promise<boolean> {
    const [result] = await getDatabasePool().execute<ResultSetHeader>(
      'UPDATE drivers SET status = ? WHERE id = ?',
      [status, id],
    );

    return result.affectedRows > 0;
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
  }): Promise<boolean> {
    return withTransaction(async (connection) => {
      const updates: string[] = [];
      const values: Array<string | number | null> = [];

      if (input.firstName) {
        updates.push('first_name = ?');
        values.push(input.firstName);
      }
      if (input.lastName) {
        updates.push('last_name = ?');
        values.push(input.lastName);
      }
      if (input.phone) {
        updates.push('phone = ?');
        values.push(input.phone);
      }
      if (input.licenseNumber) {
        updates.push('license_number = ?');
        values.push(input.licenseNumber);
      }
      if (input.licenseCategory) {
        updates.push('license_category = ?');
        values.push(input.licenseCategory);
      }
      if (input.licenseExpiryDate !== undefined) {
        updates.push('license_expiry_date = ?');
        values.push(input.licenseExpiryDate || null);
      }
      if (input.hireDate !== undefined) {
        updates.push('hire_date = ?');
        values.push(input.hireDate || null);
      }
      if (input.status) {
        updates.push('status = ?');
        values.push(input.status);
      }
      if (input.notes !== undefined) {
        updates.push('notes = ?');
        values.push(input.notes ?? null);
      }

      if (updates.length > 0) {
        values.push(id);
        const [result] = await connection.execute<ResultSetHeader>(
          `UPDATE drivers SET ${updates.join(', ')} WHERE id = ?`,
          values,
        );

        if (result.affectedRows === 0) {
          return false;
        }
      }

      if (input.vehicleId) {
        await connection.execute(
          `UPDATE vehicle_assignments
           SET status = 'completed', ends_at = NOW()
           WHERE driver_id = ? AND status = 'active'`,
          [id],
        );

        await connection.execute(
          `INSERT INTO vehicle_assignments (vehicle_id, driver_id, starts_at, status)
           VALUES (?, ?, NOW(), 'active')`,
          [input.vehicleId, id],
        );

        await connection.execute(
          `UPDATE vehicles SET status = 'assigned' WHERE id = ?`,
          [input.vehicleId],
        );
      }

      return true;
    });
  }
}
