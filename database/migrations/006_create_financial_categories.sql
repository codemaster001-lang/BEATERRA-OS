CREATE TABLE financial_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, parent_id BIGINT UNSIGNED NULL, name VARCHAR(150) NOT NULL, category_type ENUM('income','expense') NOT NULL,
  color VARCHAR(7) NULL, is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_financial_categories_type_name (category_type,name), KEY idx_financial_categories_parent (parent_id),
  CONSTRAINT fk_financial_categories_parent FOREIGN KEY (parent_id) REFERENCES financial_categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
