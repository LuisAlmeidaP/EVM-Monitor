import { EvmInterpretation } from './evm-interpretation';

export type EvmOverallStatus = 'saludable' | 'en_riesgo' | 'critico';

/**
 * Clasifica una interpretación EVM ya calculada (F4) en un estado general,
 * combinando costStatus y scheduleStatus. Compartida entre el análisis de
 * Actividad (F7) y el análisis Consolidado de Proyecto (F8) para no duplicar
 * la regla en dos lugares.
 */
export function deriveOverallStatus(
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
