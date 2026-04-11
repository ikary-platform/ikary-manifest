import { Global, Module } from '@nestjs/common';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';

@Global()
@Module({
  providers: [
    {
      provide: DatabaseService,
      useFactory: (): DatabaseService => {
        const rawDbUrl = process.env['DATABASE_URL'] ?? 'postgres://ikary:ikary@localhost:5432/ikary';
        const dbOptions = databaseConnectionOptionsSchema.parse({ connectionString: rawDbUrl });
        return new DatabaseService(dbOptions);
      },
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
