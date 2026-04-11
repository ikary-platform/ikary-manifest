import { randomUUID } from 'node:crypto';
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
        .where('email', 'like', email)
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
        id: randomUUID(),
        email: params.email.toLowerCase(),
        password_hash: params.passwordHash,
        is_email_verified: this.db.bool(false),
        is_system_admin: this.db.bool(params.isSystemAdmin ?? false),
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
        updated_at: this.db.now(),
      })
      .where('id', '=', userId)
      .execute();
  }

  async markEmailVerified(userId: string, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('users')
      .set({
        is_email_verified: this.db.bool(true),
        email_verified_at: this.db.now(),
        updated_at: this.db.now(),
      })
      .where('id', '=', userId)
      .execute();
  }

  async updateLastLogin(userId: string, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('users')
      .set({
        last_login_at: this.db.now(),
        updated_at: this.db.now(),
      })
      .where('id', '=', userId)
      .execute();
  }

  async setSystemAdmin(userId: string, isSystemAdmin: boolean, client?: Queryable<AuthDatabaseSchema>): Promise<void> {
    await this.executor(client)
      .updateTable('users')
      .set({
        is_system_admin: this.db.bool(isSystemAdmin),
        updated_at: this.db.now(),
      })
      .where('id', '=', userId)
      .execute();
  }
}
