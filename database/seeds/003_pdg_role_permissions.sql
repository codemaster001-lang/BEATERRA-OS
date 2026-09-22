INSERT INTO role_permissions (role_id, permission_id) SELECT r.id,p.id FROM roles r CROSS JOIN permissions p WHERE r.slug='pdg-administrateur' ON DUPLICATE KEY UPDATE role_id=VALUES(role_id);
