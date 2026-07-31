import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManageActivitiesUseCase } from '../../application/activities/use-cases/manage-activities.use-case';
import { ACTIVITY_REPOSITORY } from '../../application/activities/ports/activity-repository.port';
import { ProjectsModule } from '../projects/projects.module';
import { ActivityOrmEntity } from './entities/activity.orm-entity';
import { ActivityRepository } from './activity.repository';
import { ActivitiesController } from './activities.controller';
import { ProjectActivitiesController } from './project-activities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityOrmEntity]), ProjectsModule],
  controllers: [ActivitiesController, ProjectActivitiesController],
  providers: [
    ManageActivitiesUseCase,
    { provide: ACTIVITY_REPOSITORY, useClass: ActivityRepository },
  ],
})
export class ActivitiesModule {}
