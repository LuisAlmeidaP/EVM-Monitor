import { Injectable } from '@nestjs/common';
import { Activity } from '../../../domain/activities/activity';
import { EvmAnalysis } from '../../../domain/evm/evm-analysis';
import { EvmAnalyzer } from '../../../domain/evm/evm-analyzer';
import { ManageActivitiesUseCase } from './manage-activities.use-case';

export interface ActivityEvmAnalysisResult {
  readonly activity: Activity;
  readonly analysis: EvmAnalysis;
}

/**
 * Únicamente recupera la actividad (reutilizando ManageActivitiesUseCase, que ya
 * maneja el caso de "no encontrada") y delega el cálculo al dominio. No contiene
 * matemática ni reglas de negocio propias.
 */
@Injectable()
export class AnalyzeActivityEvmUseCase {
  private readonly analyzer = new EvmAnalyzer();

  constructor(
    private readonly manageActivitiesUseCase: ManageActivitiesUseCase,
  ) {}

  async execute(activityId: string): Promise<ActivityEvmAnalysisResult> {
    const activity = await this.manageActivitiesUseCase.findById(activityId);
    const analysis = this.analyzer.analyze(activity.progressData);

    return { activity, analysis };
  }
}
