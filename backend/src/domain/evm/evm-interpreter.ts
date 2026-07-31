import {
  CostPerformanceStatus,
  EvmInterpretation,
  SchedulePerformanceStatus,
} from './evm-interpretation';

const NEUTRAL_PERFORMANCE_INDEX = 1;

export class EvmInterpreter {
  interpret(cpi: number | null, spi: number | null): EvmInterpretation {
    return {
      costStatus: this.interpretCost(cpi),
      scheduleStatus: this.interpretSchedule(spi),
    };
  }

  private interpretCost(cpi: number | null): CostPerformanceStatus | null {
    if (cpi === null) return null;
    if (cpi > NEUTRAL_PERFORMANCE_INDEX) return 'bajo_presupuesto';
    if (cpi < NEUTRAL_PERFORMANCE_INDEX) return 'sobre_presupuesto';
    return 'en_presupuesto';
  }

  private interpretSchedule(
    spi: number | null,
  ): SchedulePerformanceStatus | null {
    if (spi === null) return null;
    if (spi > NEUTRAL_PERFORMANCE_INDEX) return 'adelantado';
    if (spi < NEUTRAL_PERFORMANCE_INDEX) return 'atrasado';
    return 'a_tiempo';
  }
}
