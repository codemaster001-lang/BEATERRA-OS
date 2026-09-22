CREATE TABLE account_transfers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, from_account_id BIGINT UNSIGNED NOT NULL, to_account_id BIGINT UNSIGNED NOT NULL,
  outgoing_transaction_id BIGINT UNSIGNED NOT NULL, incoming_transaction_id BIGINT UNSIGNED NOT NULL, amount DECIMAL(15,2) NOT NULL, transfer_date DATE NOT NULL,
  reference_number VARCHAR(100) NULL, notes VARCHAR(500) NULL, status ENUM('pending','completed','cancelled') NOT NULL DEFAULT 'completed', created_by_user_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_transfers_outgoing_tx (outgoing_transaction_id), UNIQUE KEY uq_transfers_incoming_tx (incoming_transaction_id), KEY idx_transfers_accounts_date (from_account_id,to_account_id,transfer_date),
  CONSTRAINT chk_transfer_amount CHECK (amount > 0), CONSTRAINT chk_transfer_accounts CHECK (from_account_id <> to_account_id), CONSTRAINT chk_transfer_transactions CHECK (outgoing_transaction_id <> incoming_transaction_id),
  CONSTRAINT fk_transfer_from FOREIGN KEY (from_account_id) REFERENCES financial_accounts(id) ON DELETE RESTRICT, CONSTRAINT fk_transfer_to FOREIGN KEY (to_account_id) REFERENCES financial_accounts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_transfer_outgoing FOREIGN KEY (outgoing_transaction_id) REFERENCES financial_transactions(id) ON DELETE RESTRICT, CONSTRAINT fk_transfer_incoming FOREIGN KEY (incoming_transaction_id) REFERENCES financial_transactions(id) ON DELETE RESTRICT,
  CONSTRAINT fk_transfer_user FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
