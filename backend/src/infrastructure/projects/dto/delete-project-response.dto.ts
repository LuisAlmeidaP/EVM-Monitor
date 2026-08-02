import { ApiProperty } from '@nestjs/swagger';

export class DeleteProjectResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación de la eliminación.',
    example: 'El proyecto fue eliminado correctamente.',
  })
  readonly mensaje: string;
}
