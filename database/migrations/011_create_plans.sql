CREATE TABLE plans (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, project_id BIGINT UNSIGNED NOT NULL, name VARCHAR(200) NOT NULL, plan_type ENUM('architectural','structural','electrical','plumbing','other') NOT NULL DEFAULT 'other', file_path VARCHAR(500) NOT NULL, version VARCHAR(50) NULL, uploaded_by_user_id BIGINT UNSIGNED NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, KEY idx_plans_project_type (project_id,plan_type),
 CONSTRAINT fk_plans_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT, CONSTRAINT fk_plans_user FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
