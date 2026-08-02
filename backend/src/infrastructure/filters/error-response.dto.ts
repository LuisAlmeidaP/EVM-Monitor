import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  ErrorCategory,
  ErrorResponseBody,
} from './error-response.interface';

const ERROR_CATEGORIES: ErrorCategory[] = [
  'validacion',
  'negocio',
  'no_encontrado',
  'inesperado',
];

/**
 * Espejo, solo para documentación OpenAPI, de ErrorResponseBody (contrato de
 * errores uniforme implementado en F3 por GlobalExceptionFilter). No se usa
 * en tiempo de ejecución: el filtro sigue devolviendo ErrorResponseBody tal
 * cual; esta clase únicamente le da a Swagger un esquema reflectable.
 */
export class ErrorResponseDto implements ErrorResponseBody {
  @ApiProperty({
    description:
      'Categoría del error. "validacion" son errores estructurales de la petición (400), ' +
      '"negocio" son violaciones de reglas del dominio (422), "no_encontrado" es un recurso ' +
      'inexistente (404) y "inesperado" es cualquier otro error no controlado (500).',
    enum: ERROR_CATEGORIES,
    example: 'no_encontrado',
  })
  categoria: ErrorCategory;

  @ApiProperty({
    description:
      'Mensaje descriptivo del error, listo para mostrar al usuario final.',
    example:
      'No se encontró un proyecto con el identificador "3fa85f64-5717-4562-b3fc-2c963f66afa6".',
  })
  mensaje: string;

  @ApiProperty({
    description:
      'Identificador único (UUID) de esta ocurrencia del error, útil para correlacionarla ' +
      'con los logs del servidor.',
    example: 'b2a1f6d4-9e3a-4c7e-8b1a-6f2d3e4c5a6b',
    format: 'uuid',
  })
  referencia: string;

  @ApiPropertyOptional({
    description:
      'Detalles adicionales del error, presentes únicamente cuando hay más de una violación ' +
      '(por ejemplo, varias reglas de negocio incumplidas a la vez).',
    example: [
      'El presupuesto planificado (BAC) debe ser un número mayor o igual a cero.',
      'El porcentaje de avance real debe estar entre 0 y 100.',
    ],
    type: [String],
  })
  detalles?: string[];
}
