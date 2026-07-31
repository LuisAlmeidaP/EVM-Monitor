import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './infrastructure/config/database.config';
import { envValidationSchema } from './infrastructure/config/env.validation';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { ProjectsModule } from './infrastructure/projects/projects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validationSchema: envValidationSchema,
    }),
    PersistenceModule,
    ProjectsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
