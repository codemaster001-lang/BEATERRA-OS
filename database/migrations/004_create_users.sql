CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, role_id BIGINT UNSIGNED NOT NULL, first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL,
  email VARCHAR(191) NOT NULL, password_hash VARCHAR(255) NOT NULL, phone VARCHAR(30) NULL, avatar_url VARCHAR(500) NULL,
  status ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active', last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email), KEY idx_users_role_status (role_id,status),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
