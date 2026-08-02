import { ApiProperty } from '@nestjs/swagger';

export class DeleteActivityResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación de la eliminación.',
    example: 'La actividad fue eliminada correctamente.',
  })
  readonly mensaje: string;
}
