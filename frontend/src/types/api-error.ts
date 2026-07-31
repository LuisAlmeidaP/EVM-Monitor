export type ErrorCategoria = 'validacion' | 'negocio' | 'no_encontrado' | 'inesperado';

export interface ApiErrorBody {
  readonly categoria: ErrorCategoria;
  readonly mensaje: string;
  readonly referencia: string;
  readonly detalles?: string[];
}
