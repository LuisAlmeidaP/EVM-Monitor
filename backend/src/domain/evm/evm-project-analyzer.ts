import { ActivityProgressData } from './activity-progress-data';
import { EvmAnalysis } from './evm-analysis';
import { EvmConsolidator } from './evm-consolidator';
import { EvmInterpreter } from './evm-interpreter';
import { deriveOverallStatus } from './evm-overall-status';

/**
 * Orquesta la consolidación (EvmConsolidator) y la interpretación
 * (EvmInterpreter) de F4 sin reimplementar ninguna fórmula. Lanza
 * EmptyProjectActivitiesException (F4) cuando el proyecto no tiene
 * actividades — el mismo comportamiento que EvmConsolidator ya define.
 */
export class EvmProjectAnalyzer {
  private readonly consolidator = new EvmConsolidator();
  private readonly interpreter = new EvmInterpreter();

  analyze(activities: ActivityProgressData[]): EvmAnalysis {
    const indicators = this.consolidator.consolidate(activities);
    const interpretation = this.interpreter.interpret(
      indicators.cpi,
      indicators.spi,
    );

    return {
      indicators,
      interpretation,
      overallStatus: deriveOverallStatus(interpretation),
    };
  }
}
