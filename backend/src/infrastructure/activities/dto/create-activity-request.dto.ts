import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { ACTIVITY_NAME_MAX_LENGTH } from '../entities/activity.orm-entity';

export class CreateActivityRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(ACTIVITY_NAME_MAX_LENGTH)
  nombre: string;

  @IsNumber()
  bac: number;

  @IsNumber()
  porcentajeAvancePlanificado: number;

  @IsNumber()
  porcentajeAvanceReal: number;

  @IsNumber()
  costoReal: number;
}
