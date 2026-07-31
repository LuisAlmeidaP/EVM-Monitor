import { Activity } from '../../../domain/activities/activity';

export class ActivityResponseDto {
  readonly id: string;
  readonly proyectoId: string;
  readonly nombre: string;
  readonly bac: number;
  readonly porcentajeAvancePlanificado: number;
  readonly porcentajeAvanceReal: number;
  readonly costoReal: number;

  private constructor(activity: Activity) {
    this.id = activity.id;
    this.proyectoId = activity.projectId;
    this.nombre = activity.name;
    this.bac = activity.progressData.bac;
    this.porcentajeAvancePlanificado = activity.progressData.plannedPercentage;
    this.porcentajeAvanceReal = activity.progressData.actualPercentage;
    this.costoReal = activity.progressData.actualCost;
  }

  static fromDomain(activity: Activity): ActivityResponseDto {
    return new ActivityResponseDto(activity);
  }
}
