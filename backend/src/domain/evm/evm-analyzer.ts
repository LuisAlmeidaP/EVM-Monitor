import { ActivityProgressData } from './activity-progress-data';
import { EvmAnalysis } from './evm-analysis';
import { EvmCalculator } from './evm-calculator';
import { EvmInterpreter } from './evm-interpreter';
import { deriveOverallStatus } from './evm-overall-status';

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
      overallStatus: deriveOverallStatus(interpretation),
    };
  }
}
