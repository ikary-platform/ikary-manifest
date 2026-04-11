import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '../../database/database.service';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(@Inject(UserRepository) private readonly users: UserRepository) {}

  findByEmail(email: string, client?: Queryable) {
    return this.users.findByEmail(email, client);
  }

  findById(userId: string, client?: Queryable) {
    return this.users.findById(userId, client);
  }

  create(email: string, passwordHash: string | null, client?: Queryable, options?: { isSystemAdmin?: boolean }) {
    return this.users.create({ email, passwordHash, isSystemAdmin: options?.isSystemAdmin }, client);
  }

  markEmailVerified(userId: string, client?: Queryable) {
    return this.users.markEmailVerified(userId, client);
  }

  updatePassword(userId: string, passwordHash: string, client?: Queryable) {
    return this.users.updatePassword(userId, passwordHash, client);
  }

  updateLastLogin(userId: string, client?: Queryable) {
    return this.users.updateLastLogin(userId, client);
  }

  setSystemAdmin(userId: string, isSystemAdmin: boolean, client?: Queryable) {
    return this.users.setSystemAdmin(userId, isSystemAdmin, client);
  }
}
