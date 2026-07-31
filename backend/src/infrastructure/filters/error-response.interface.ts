export type ErrorCategory =
  'validacion' | 'negocio' | 'no_encontrado' | 'inesperado';

export interface ErrorResponseBody {
  categoria: ErrorCategory;
  mensaje: string;
  referencia: string;
  detalles?: string[];
}
