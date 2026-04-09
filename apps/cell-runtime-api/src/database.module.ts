import { Global, Module } from '@nestjs/common';
import { DatabaseService, databaseConnectionOptionsSchema } from '@ikary/system-db-core';

@Global()
@Module({
  providers: [
    {
      provide: DatabaseService,
      useFactory: (): DatabaseService => {
        const rawDbUrl = process.env['DATABASE_URL'] ?? `sqlite://${process.cwd()}/local.db`;
        const dbOptions = databaseConnectionOptionsSchema.parse({ connectionString: rawDbUrl });
        return new DatabaseService(dbOptions);
      },
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
