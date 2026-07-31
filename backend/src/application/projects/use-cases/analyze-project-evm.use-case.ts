import { Injectable } from '@nestjs/common';
import { EvmAnalysis } from '../../../domain/evm/evm-analysis';
import { EvmProjectAnalyzer } from '../../../domain/evm/evm-project-analyzer';
import { ManageActivitiesUseCase } from '../../activities/use-cases/manage-activities.use-case';

export interface ProjectEvmAnalysisResult {
  readonly projectId: string;
  readonly activityCount: number;
  readonly analysis: EvmAnalysis;
}

/**
 * Únicamente recupera las actividades del proyecto (reutilizando
 * ManageActivitiesUseCase, que ya valida que el proyecto exista) y delega la
 * consolidación al dominio. No contiene matemática ni reglas de negocio propias.
 */
@Injectable()
export class AnalyzeProjectEvmUseCase {
  private readonly analyzer = new EvmProjectAnalyzer();

  constructor(
    private readonly manageActivitiesUseCase: ManageActivitiesUseCase,
  ) {}

  async execute(projectId: string): Promise<ProjectEvmAnalysisResult> {
    const activities =
      await this.manageActivitiesUseCase.findAllByProject(projectId);
    const analysis = this.analyzer.analyze(
      activities.map((activity) => activity.progressData),
    );

    return {
      projectId,
      activityCount: activities.length,
      analysis,
    };
  }
}
