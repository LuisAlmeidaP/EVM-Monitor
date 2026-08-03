import { ActivityProgressData } from './activity-progress-data';
import {
  computeIndicatorsFromTotals,
  derivePlannedAndEarnedValue,
} from './evm-formulas';
import { EvmIndicators } from './evm-indicators';

export class EvmCalculator {
  calculate(data: ActivityProgressData): EvmIndicators {
    const { pv, ev } = derivePlannedAndEarnedValue(data);
    return computeIndicatorsFromTotals(data.bac, pv, ev, data.actualCost);
  }
}
