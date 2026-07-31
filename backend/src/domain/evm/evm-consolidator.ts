import { ActivityProgressData } from './activity-progress-data';
import { EmptyProjectActivitiesException } from './exceptions/empty-project-activities.exception';
import {
  computeIndicatorsFromTotals,
  derivePlannedAndEarnedValue,
} from './evm-formulas';
import { EvmIndicators } from './evm-indicators';

interface EvmTotals {
  readonly bac: number;
  readonly pv: number;
  readonly ev: number;
  readonly ac: number;
}

const INITIAL_TOTALS: EvmTotals = { bac: 0, pv: 0, ev: 0, ac: 0 };

export class EvmConsolidator {
  /**
   * Consolida sumando los valores base (BAC, PV, EV, AC) de todas las actividades
   * y recalculando los ratios sobre esos totales — el método estándar del PMI
   * para llevar el análisis EVM de actividad a nivel de proyecto.
   */
  consolidate(activities: ActivityProgressData[]): EvmIndicators {
    if (activities.length === 0) {
      throw new EmptyProjectActivitiesException();
    }

    const totals = activities.reduce(
      (accumulated, activity) =>
        this.addActivityToTotals(accumulated, activity),
      INITIAL_TOTALS,
    );

    return computeIndicatorsFromTotals(
      totals.bac,
      totals.pv,
      totals.ev,
      totals.ac,
    );
  }

  private addActivityToTotals(
    totals: EvmTotals,
    activity: ActivityProgressData,
  ): EvmTotals {
    const { pv, ev } = derivePlannedAndEarnedValue(activity);

    return {
      bac: totals.bac + activity.bac,
      pv: totals.pv + pv,
      ev: totals.ev + ev,
      ac: totals.ac + activity.actualCost,
    };
  }
}
