ALTER TABLE drivers
  ADD COLUMN driver_code VARCHAR(30) NULL AFTER id,
  ADD COLUMN license_category VARCHAR(30) NULL AFTER license_number,
  ADD COLUMN notes TEXT NULL AFTER status,
  MODIFY status ENUM('active','inactive','suspended','on_leave') NOT NULL DEFAULT 'active';

ALTER TABLE drivers
  ADD UNIQUE KEY uq_drivers_driver_code (driver_code);

ALTER TABLE vehicles
  ADD COLUMN notes TEXT NULL AFTER acquisition_date;
