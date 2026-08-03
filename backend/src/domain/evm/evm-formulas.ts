import { ActivityProgressData } from './activity-progress-data';
import { EvmIndicators } from './evm-indicators';

const PERCENTAGE_DIVISOR = 100;

export interface PlannedAndEarnedValue {
  readonly pv: number;
  readonly ev: number;
}

/**
 * PV y EV son, por definición del estándar EVM, el porcentaje (planificado o real)
 * aplicado sobre el presupuesto total (BAC) de una actividad.
 */
export function derivePlannedAndEarnedValue(
  data: ActivityProgressData,
): PlannedAndEarnedValue {
  return {
    pv: (data.plannedPercentage / PERCENTAGE_DIVISOR) * data.bac,
    ev: (data.actualPercentage / PERCENTAGE_DIVISOR) * data.bac,
  };
}

/**
 * CPI y SPI son indeterminados cuando su divisor es cero (AC=0 o PV=0
 * respectivamente); EAC hereda esa indeterminación cuando CPI es null o cero.
 */
export function computeIndicatorsFromTotals(
  bac: number,
  pv: number,
  ev: number,
  ac: number,
): EvmIndicators {
  const cv = ev - ac;
  const sv = ev - pv;
  const cpi = ac === 0 ? null : ev / ac;
  const spi = pv === 0 ? null : ev / pv;
  const eac = cpi === null || cpi === 0 ? null : bac / cpi;
  const vac = eac === null ? null : bac - eac;

  return { pv, ev, cv, sv, cpi, spi, eac, vac };
}
