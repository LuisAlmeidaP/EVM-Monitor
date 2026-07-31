export type CostPerformanceStatus =
  'bajo_presupuesto' | 'sobre_presupuesto' | 'en_presupuesto';

export type SchedulePerformanceStatus = 'adelantado' | 'atrasado' | 'a_tiempo';

export interface EvmInterpretation {
  readonly costStatus: CostPerformanceStatus | null;
  readonly scheduleStatus: SchedulePerformanceStatus | null;
}
