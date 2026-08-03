import { ApiProperty } from '@nestjs/swagger';
import { Activity } from '../../../domain/activities/activity';

export class ActivityResponseDto {
  @ApiProperty({
    description: 'Identificador único de la actividad.',
    example: 'c1d2e3f4-5678-90ab-cdef-1234567890ab',
    format: 'uuid',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Identificador del proyecto al que pertenece la actividad.',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
  })
  readonly proyectoId: string;

  @ApiProperty({
    description: 'Nombre de la actividad.',
    example: 'Excavación',
  })
  readonly nombre: string;

  @ApiProperty({
    description: 'Presupuesto planificado (Budget At Completion).',
    example: 100_000,
    minimum: 0,
  })
  readonly bac: number;

  @ApiProperty({
    description: 'Porcentaje de avance planificado a la fecha (0-100).',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  readonly porcentajeAvancePlanificado: number;

  @ApiProperty({
    description: 'Porcentaje de avance real ejecutado a la fecha (0-100).',
    example: 40,
    minimum: 0,
    maximum: 100,
  })
  readonly porcentajeAvanceReal: number;

  @ApiProperty({
    description: 'Costo real incurrido (Actual Cost).',
    example: 50_000,
    minimum: 0,
  })
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
