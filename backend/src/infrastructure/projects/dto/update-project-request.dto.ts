import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PROJECT_NAME_MAX_LENGTH } from '../entities/project.orm-entity';

export class UpdateProjectRequestDto {
  @ApiProperty({
    description:
      'Nuevo nombre del proyecto. Es obligatorio: una cadena vacía se rechaza como error de ' +
      'validación (400). Un valor compuesto solo por espacios en blanco pasa la validación ' +
      'estructural pero es rechazado por el dominio como error de negocio (422).',
    example: 'Ampliación planta norte — fase 2',
    maxLength: PROJECT_NAME_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PROJECT_NAME_MAX_LENGTH)
  nombre: string;
}
