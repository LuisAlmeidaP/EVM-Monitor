import { ActivityProgressData } from './activity-progress-data';
import { EvmAnalysis } from './evm-analysis';
import { EvmCalculator } from './evm-calculator';
import { EvmInterpretation } from './evm-interpretation';
import { EvmInterpreter } from './evm-interpreter';
import { EvmOverallStatus } from './evm-overall-status';

/**
 * Orquesta el cálculo (EvmCalculator) y la interpretación (EvmInterpreter) de F4
 * sin reimplementar ninguna fórmula, y deriva el estado general combinando
 * costStatus y scheduleStatus.
 */
export class EvmAnalyzer {
  private readonly calculator = new EvmCalculator();
  private readonly interpreter = new EvmInterpreter();

  analyze(data: ActivityProgressData): EvmAnalysis {
    const indicators = this.calculator.calculate(data);
    const interpretation = this.interpreter.interpret(
      indicators.cpi,
      indicators.spi,
    );

    return {
      indicators,
      interpretation,
      overallStatus: this.deriveOverallStatus(interpretation),
    };
  }

  private deriveOverallStatus(
    interpretation: EvmInterpretation,
  ): EvmOverallStatus | null {
    const { costStatus, scheduleStatus } = interpretation;

    if (costStatus === null || scheduleStatus === null) {
      return null;
    }

    const costEnRegla = costStatus !== 'sobre_presupuesto';
    const cronogramaEnRegla = scheduleStatus !== 'atrasado';

    if (costEnRegla && cronogramaEnRegla) return 'saludable';
    if (!costEnRegla && !cronogramaEnRegla) return 'critico';
    return 'en_riesgo';
  }
}
