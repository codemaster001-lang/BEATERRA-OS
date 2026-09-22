CREATE TABLE invoice_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT UNSIGNED NOT NULL,
  financial_transaction_id BIGINT UNSIGNED NOT NULL,
  recorded_by_user_id BIGINT UNSIGNED NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_invoice_payments_financial_transaction (financial_transaction_id),
  KEY idx_invoice_payments_invoice_date (invoice_id, payment_date),
  CONSTRAINT chk_invoice_payments_amount CHECK (amount > 0),
  CONSTRAINT fk_invoice_payments_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
  CONSTRAINT fk_invoice_payments_financial_transaction FOREIGN KEY (financial_transaction_id) REFERENCES financial_transactions(id) ON DELETE RESTRICT,
  CONSTRAINT fk_invoice_payments_user FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
