BEGIN;

-- Register feature codes required by system-entity governance.
--
-- AUDIT_READ   — gates access to GET /audit and GET /audit/:auditId via RequireFeature.
-- ENTITY_ROLLBACK — gates rollback endpoints on all governed domain resources.
--
-- Both codes must exist before any RequireFeature guard is evaluated.
INSERT INTO features (code, description)
VALUES
  ('AUDIT_READ',       'View audit history for governed entities'),
  ('ENTITY_ROLLBACK',  'Rollback governed entities to a prior version')
ON CONFLICT (code) DO NOTHING;

COMMIT;
