export type EstadoCosto = 'bajo_presupuesto' | 'sobre_presupuesto' | 'en_presupuesto';
export type EstadoCronograma = 'adelantado' | 'atrasado' | 'a_tiempo';
export type EstadoGeneral = 'saludable' | 'en_riesgo' | 'critico';

export interface DatosAvanceEvm {
  readonly bac: number;
  readonly porcentajeAvancePlanificado: number;
  readonly porcentajeAvanceReal: number;
  readonly costoReal: number;
}

export interface IndicadoresEvm {
  readonly pv: number;
  readonly ev: number;
  readonly cv: number;
  readonly sv: number;
  readonly cpi: number | null;
  readonly spi: number | null;
  readonly eac: number | null;
  readonly vac: number | null;
}

export interface InterpretacionEvm {
  readonly estadoCosto: EstadoCosto | null;
  readonly estadoCronograma: EstadoCronograma | null;
}

export interface AnalisisEvmActividad {
  readonly actividadId: string;
  readonly proyectoId: string;
  readonly nombre: string;
  readonly datosAvance: DatosAvanceEvm;
  readonly indicadores: IndicadoresEvm;
  readonly interpretacion: InterpretacionEvm;
  readonly estadoGeneral: EstadoGeneral | null;
}

export interface AnalisisConsolidadoProyecto {
  readonly proyectoId: string;
  readonly cantidadActividades: number;
  readonly indicadores: IndicadoresEvm;
  readonly interpretacion: InterpretacionEvm;
  readonly estadoGeneral: EstadoGeneral | null;
}

export interface ActividadComparativaEvm {
  readonly id: string;
  readonly nombre: string;
  readonly pv: number;
  readonly ev: number;
  readonly ac: number;
  readonly cv: number;
  readonly sv: number;
  readonly estadoGeneral: EstadoGeneral | null;
}
