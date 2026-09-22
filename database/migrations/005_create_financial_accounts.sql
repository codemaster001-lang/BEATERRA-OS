CREATE TABLE financial_accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(150) NOT NULL, account_type ENUM('cash','bank','mobile_money','savings','other') NOT NULL,
  institution_name VARCHAR(150) NULL, account_reference VARCHAR(100) NULL, currency_code CHAR(3) NOT NULL DEFAULT 'XOF', opening_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_financial_accounts_name (name), UNIQUE KEY uq_financial_account_reference (account_reference), KEY idx_financial_accounts_type_active (account_type,is_active),
  CONSTRAINT chk_financial_accounts_currency CHECK (currency_code = 'XOF'), CONSTRAINT chk_financial_accounts_opening_balance CHECK (opening_balance >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
