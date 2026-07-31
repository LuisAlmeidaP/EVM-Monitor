import { EvmIndicators } from './evm-indicators';
import { EvmInterpretation } from './evm-interpretation';
import { EvmOverallStatus } from './evm-overall-status';

export interface EvmAnalysis {
  readonly indicators: EvmIndicators;
  readonly interpretation: EvmInterpretation;
  readonly overallStatus: EvmOverallStatus | null;
}
