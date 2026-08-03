import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { ACTIVITY_NAME_MAX_LENGTH } from '../entities/activity.orm-entity';

export class CreateActivityRequestDto {
  @ApiProperty({
    description:
      'Nombre de la actividad. Es obligatorio: una cadena vacía se rechaza como error de ' +
      'validación (400). Un valor compuesto solo por espacios en blanco pasa la validación ' +
      'estructural pero es rechazado por el dominio como error de negocio (422).',
    example: 'Excavación',
    maxLength: ACTIVITY_NAME_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(ACTIVITY_NAME_MAX_LENGTH)
  nombre: string;

  @ApiProperty({
    description:
      'Presupuesto planificado (Budget At Completion). Debe ser un número mayor o igual a ' +
      'cero; se valida a nivel estructural que sea numérico (400), y a nivel de dominio que no ' +
      'sea negativo (422).',
    example: 100_000,
    minimum: 0,
  })
  @IsNumber()
  bac: number;

  @ApiProperty({
    description:
      'Porcentaje de avance planificado a la fecha, entre 0 y 100. Se valida a nivel ' +
      'estructural que sea numérico (400), y a nivel de dominio que esté en rango (422).',
    example: 50,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  porcentajeAvancePlanificado: number;

  @ApiProperty({
    description:
      'Porcentaje de avance real ejecutado a la fecha, entre 0 y 100. Se valida a nivel ' +
      'estructural que sea numérico (400), y a nivel de dominio que esté en rango (422).',
    example: 40,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  porcentajeAvanceReal: number;

  @ApiProperty({
    description:
      'Costo real incurrido (Actual Cost). Debe ser un número mayor o igual a cero; se valida ' +
      'a nivel estructural que sea numérico (400), y a nivel de dominio que no sea negativo (422).',
    example: 50_000,
    minimum: 0,
  })
  @IsNumber()
  costoReal: number;
}
