import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyzeActivityEvmUseCase } from '../../application/activities/use-cases/analyze-activity-evm.use-case';
import { ManageActivitiesUseCase } from '../../application/activities/use-cases/manage-activities.use-case';
import { AnalyzeProjectEvmUseCase } from '../../application/projects/use-cases/analyze-project-evm.use-case';
import { ACTIVITY_REPOSITORY } from '../../application/activities/ports/activity-repository.port';
import { ProjectsModule } from '../projects/projects.module';
import { ActivityOrmEntity } from './entities/activity.orm-entity';
import { ActivityRepository } from './activity.repository';
import { ActivitiesController } from './activities.controller';
import { ActivityEvmAnalysisController } from './activity-evm-analysis.controller';
import { ProjectActivitiesController } from './project-activities.controller';
import { ProjectEvmAnalysisController } from '../projects/project-evm-analysis.controller';

/**
 * ProjectEvmAnalysisController vive bajo /proyectos pero se registra aquí:
 * necesita ManageActivitiesUseCase, y ActivitiesModule ya importa
 * ProjectsModule (para PROJECT_REPOSITORY). Registrarlo en ProjectsModule en
 * cambio requeriría que ProjectsModule importe ActivitiesModule, creando una
 * dependencia circular entre ambos módulos.
 */
@Module({
  imports: [TypeOrmModule.forFeature([ActivityOrmEntity]), ProjectsModule],
  controllers: [
    ActivitiesController,
    ActivityEvmAnalysisController,
    ProjectActivitiesController,
    ProjectEvmAnalysisController,
  ],
  providers: [
    ManageActivitiesUseCase,
    AnalyzeActivityEvmUseCase,
    AnalyzeProjectEvmUseCase,
    { provide: ACTIVITY_REPOSITORY, useClass: ActivityRepository },
  ],
})
export class ActivitiesModule {}
