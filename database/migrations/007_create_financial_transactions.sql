CREATE TABLE financial_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, account_id BIGINT UNSIGNED NOT NULL, category_id BIGINT UNSIGNED NULL, created_by_user_id BIGINT UNSIGNED NULL,
  transaction_type ENUM('income','expense','transfer_in','transfer_out') NOT NULL, amount DECIMAL(15,2) NOT NULL, transaction_date DATE NOT NULL, description VARCHAR(500) NOT NULL,
  payment_method ENUM('cash','bank_transfer','mobile_money','card','cheque','other') NOT NULL DEFAULT 'cash', reference_number VARCHAR(100) NULL,
  source_module ENUM('btp','transport','agriculture','livestock','finance','agenda','documents','manual','other') NOT NULL DEFAULT 'manual', source_type VARCHAR(100) NULL, source_id BIGINT UNSIGNED NULL,
  status ENUM('pending','completed','cancelled') NOT NULL DEFAULT 'completed', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_ft_account_date (account_id,transaction_date), KEY idx_ft_category_date (category_id,transaction_date), KEY idx_ft_source (source_module,source_type,source_id), KEY idx_ft_status_date (status,transaction_date),
  CONSTRAINT chk_ft_amount CHECK (amount > 0),
  CONSTRAINT chk_ft_transfer_category CHECK (transaction_type NOT IN ('transfer_in','transfer_out') OR category_id IS NULL),
  CONSTRAINT chk_ft_transfer_source CHECK (transaction_type NOT IN ('transfer_in','transfer_out') OR source_module = 'finance'),
  CONSTRAINT fk_ft_account FOREIGN KEY (account_id) REFERENCES financial_accounts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ft_category FOREIGN KEY (category_id) REFERENCES financial_categories(id) ON DELETE RESTRICT, CONSTRAINT fk_ft_user FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
