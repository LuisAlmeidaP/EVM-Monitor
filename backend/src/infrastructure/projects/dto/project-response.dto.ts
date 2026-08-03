import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../../../domain/projects/project';

export class ProjectResponseDto {
  @ApiProperty({
    description: 'Identificador único del proyecto.',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Nombre del proyecto.',
    example: 'Ampliación planta norte',
  })
  readonly nombre: string;

  private constructor(id: string, nombre: string) {
    this.id = id;
    this.nombre = nombre;
  }

  static fromDomain(project: Project): ProjectResponseDto {
    return new ProjectResponseDto(project.id, project.name);
  }
}
