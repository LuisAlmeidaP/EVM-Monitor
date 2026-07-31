import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'crypto';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../application/exceptions/resource-not-found.exception';
import { ErrorCategory, ErrorResponseBody } from './error-response.interface';

interface ResolvedError {
  status: number;
  categoria: ErrorCategory;
  mensaje: string;
  detalles?: string[];
}

const GENERIC_UNEXPECTED_MESSAGE =
  'Ocurrió un error inesperado. Intente nuevamente.';

const STATUS_NOT_FOUND: number = HttpStatus.NOT_FOUND;
const STATUS_BAD_REQUEST: number = HttpStatus.BAD_REQUEST;
const STATUS_CONFLICT: number = HttpStatus.CONFLICT;
const STATUS_UNPROCESSABLE_ENTITY: number = HttpStatus.UNPROCESSABLE_ENTITY;

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const referencia = randomUUID();
    const resolved = this.resolve(exception);

    this.logger.error(
      `[${referencia}] ${resolved.mensaje}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    const body: ErrorResponseBody = {
      categoria: resolved.categoria,
      mensaje: resolved.mensaje,
      referencia,
      ...(resolved.detalles?.length ? { detalles: resolved.detalles } : {}),
    };

    response.status(resolved.status).json(body);
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof DomainException) {
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        categoria: 'negocio',
        mensaje: exception.message,
        detalles: exception.details,
      };
    }

    if (exception instanceof ResourceNotFoundException) {
      return {
        status: HttpStatus.NOT_FOUND,
        categoria: 'no_encontrado',
        mensaje: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      return this.resolveHttpException(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      categoria: 'inesperado',
      mensaje: GENERIC_UNEXPECTED_MESSAGE,
    };
  }

  private resolveHttpException(exception: HttpException): ResolvedError {
    const status = exception.getStatus();
    const body = exception.getResponse();
    const rawMessage =
      typeof body === 'string'
        ? body
        : ((body as { message?: string | string[] }).message ??
          exception.message);

    return {
      status,
      categoria: this.categoriaFromStatus(status),
      mensaje: Array.isArray(rawMessage) ? exception.message : rawMessage,
      detalles: Array.isArray(rawMessage) ? rawMessage : undefined,
    };
  }

  private categoriaFromStatus(status: number): ErrorCategory {
    if (status === STATUS_NOT_FOUND) return 'no_encontrado';
    if (status === STATUS_BAD_REQUEST) return 'validacion';
    if (status === STATUS_CONFLICT || status === STATUS_UNPROCESSABLE_ENTITY) {
      return 'negocio';
    }
    return status >= 500 ? 'inesperado' : 'validacion';
  }
}
