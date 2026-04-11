import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '@ikary/system-db-core';
import { DatabaseService } from '../../database/database.service';
import type { AuthDatabaseSchema } from '../../database/schema';
import type { UserRecord } from './user.types';

@Injectable()
export class UserRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private executor(client?: Queryable<AuthDatabaseSchema>) {
    return client ?? this.db.db;
  }

  async findByEmail(email: string, client?: Queryable<AuthDatabaseSchema>): Promise<UserRecord | null> {
    return (
      (await this.executor(client)
        .selectFrom('users')
        .select([
          'id',
          'email',
          'password_hash',
          'is_email_verified',
          'is_system_admin',
          'preferred_language',
          'email_verified_at',
          'deleted_at',
        ])
        .where('email', 'ilike', email)
        .executeTakeFirst()) ?? null
    );
  }

  async findById(userId: string, client?: Queryable<AuthDatabaseSchema>): Promise<UserRecord | null> {
    return (
      (await this.executor(client)
        .selectFrom('users')
        .select([
          'id',
          'email',
          'password_hash',
          'is_email_verified',
          'is_system_admin',
          'preferred_language',
          'email_verified_at',
          'deleted_at',
        ])
        .where('id', '=', userId)
        .executeTakeFirst()) ?? null
    );
  }

  async create(
    params: { email: string; passwordHash: string | null; isSystemAdmin?: boolean },
    client?: Queryable<AuthDatabaseSchema>,
  ): Promise<UserRecord> {
    return this.executor(client)
      .insertInto('users')
      .values({
        email: params.email.toLowerCase(),
        password_hash: params.passwordHash,
        is_email_verified: false,
        is_system_admin: params.isSystemAdmin ?? false,
      })
      .returning([
        'id',
        'email',
        'password_hash',
        'is_email_verified',
        'is_system_admin',
        'preferred_language',
        'email_verified_at',
        'deleted_at',
      ])
      .executeTakeFirstOrThrow();
  }

  async updatePassword(userId: string, passwordHash: string, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('users')
      .set({
        password_hash: passwordHash,
        updated_at: new Date(),
      })
      .where('id', '=', userId)
      .execute();
  }

  async markEmailVerified(userId: string, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('users')
      .set({
        is_email_verified: true,
        email_verified_at: new Date(),
        updated_at: new Date(),
      })
      .where('id', '=', userId)
      .execute();
  }

  async updateLastLogin(userId: string, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('users')
      .set({
        last_login_at: new Date(),
        updated_at: new Date(),
      })
      .where('id', '=', userId)
      .execute();
  }

  async setSystemAdmin(userId: string, isSystemAdmin: boolean, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('users')
      .set({
        is_system_admin: isSystemAdmin,
        updated_at: new Date(),
      })
      .where('id', '=', userId)
      .execute();
  }
}
