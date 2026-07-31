export interface Actividad {
  readonly id: string;
  readonly proyectoId: string;
  readonly nombre: string;
  readonly bac: number;
  readonly porcentajeAvancePlanificado: number;
  readonly porcentajeAvanceReal: number;
  readonly costoReal: number;
}

export interface ActividadInput {
  readonly nombre: string;
  readonly bac: number;
  readonly porcentajeAvancePlanificado: number;
  readonly porcentajeAvanceReal: number;
  readonly costoReal: number;
}
