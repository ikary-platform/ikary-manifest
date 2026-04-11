-- SQLite variant of 001_auth_user_add_is_system_admin

ALTER TABLE users
  ADD COLUMN is_system_admin INTEGER NOT NULL DEFAULT 0;
