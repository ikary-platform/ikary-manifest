export interface UserRecord {
  id: string;
  email: string;
  password_hash: string | null;
  is_email_verified: boolean;
  is_system_admin: boolean;
  preferred_language?: string | null;
  email_verified_at: Date | null;
  deleted_at: Date | null;
}
