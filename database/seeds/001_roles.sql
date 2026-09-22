INSERT INTO roles (name, slug, description) VALUES ('PDG / Administrateur','pdg-administrateur','Accès complet à BEATERRA OS') ON DUPLICATE KEY UPDATE description = VALUES(description);
