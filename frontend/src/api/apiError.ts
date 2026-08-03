import type { ApiErrorBody } from '../types/api-error';

const MENSAJE_ERROR_GENERICO = 'Ocurrió un error de conexión. Intente nuevamente.';

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function obtenerMensajeDeError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.body.mensaje;
  }
  return MENSAJE_ERROR_GENERICO;
}
