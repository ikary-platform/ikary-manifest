import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../../database/database.service';

@Injectable()
export class SignupRequestRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  async invalidateForEmail(email: string, client?: Queryable): Promise<void> {
    await (client ?? this.db.db)
      .updateTable('signup_requests')
      .set({ consumed_at: new Date() })
      .where('email', '=', email.toLowerCase())
      .where('consumed_at', 'is', null)
      .execute();
  }

  async create(email: string, codeHash: string, expiresAt: Date, client?: Queryable): Promise<string> {
    const row = await (client ?? this.db.db)
      .insertInto('signup_requests')
      .values({ email, code_hash: codeHash, expires_at: expiresAt })
      .returning(['id'])
      .executeTakeFirstOrThrow();

    return row.id;
  }

  async findActiveByEmailAndCodeHash(
    email: string,
    codeHash: string,
    client?: Queryable,
  ): Promise<{ id: string } | undefined> {
    return (client ?? this.db.db)
      .selectFrom('signup_requests')
      .select(['id'])
      .where('email', '=', email.toLowerCase())
      .where('code_hash', '=', codeHash)
      .where('consumed_at', 'is', null)
      .where('expires_at', '>', new Date())
      .executeTakeFirst();
  }

  async consume(id: string, client?: Queryable): Promise<void> {
    await (client ?? this.db.db)
      .updateTable('signup_requests')
      .set({ consumed_at: new Date() })
      .where('id', '=', id)
      .execute();
  }
}
