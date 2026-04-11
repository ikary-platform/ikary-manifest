BEGIN;

INSERT INTO domains (code, description)
VALUES ('LOGS', 'Access platform activity logs')
ON CONFLICT (code) DO NOTHING;

COMMIT;
