import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { ResourceNotFoundException } from '../../application/exceptions/resource-not-found.exception';
import type { ErrorResponseBody } from './error-response.interface';

class TestDomainException extends DomainException {
  constructor(message: string, details?: string[]) {
    super(message, details);
  }
}

function createMockHost() {
  const json = jest.fn<void, [ErrorResponseBody]>();
  const status = jest
    .fn<{ json: typeof json }, [number]>()
    .mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps a DomainException to 422 with category "negocio"', () => {
    const { host, status, json } = createMockHost();
    filter.catch(
      new TestDomainException('el bac no puede ser negativo', ['bac']),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    const [body] = json.mock.calls[0];
    expect(body.categoria).toBe('negocio');
    expect(body.mensaje).toBe('el bac no puede ser negativo');
    expect(body.detalles).toEqual(['bac']);
    expect(body.referencia).toEqual(expect.any(String));
  });

  it('maps a ResourceNotFoundException to 404 with category "no_encontrado"', () => {
    const { host, status, json } = createMockHost();
    filter.catch(new ResourceNotFoundException('el proyecto no existe'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    const [body] = json.mock.calls[0];
    expect(body.categoria).toBe('no_encontrado');
    expect(body.mensaje).toBe('el proyecto no existe');
    expect(body.detalles).toBeUndefined();
  });

  it('respects the real status of a Nest HttpException and extracts field details', () => {
    const { host, status, json } = createMockHost();
    filter.catch(new BadRequestException(['el nombre es obligatorio']), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const [body] = json.mock.calls[0];
    expect(body.categoria).toBe('validacion');
    expect(body.detalles).toEqual(['el nombre es obligatorio']);
  });

  it('maps a Nest ConflictException to category "negocio"', () => {
    const { host, status, json } = createMockHost();
    filter.catch(
      new ConflictException('el proyecto ya tiene actividades asociadas'),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    const [body] = json.mock.calls[0];
    expect(body.categoria).toBe('negocio');
  });

  it('maps any unrecognized error to 500 without leaking internal details', () => {
    const { host, status, json } = createMockHost();
    filter.catch(new Error('connection refused at 10.0.0.5:5432'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const [body] = json.mock.calls[0];
    expect(body.categoria).toBe('inesperado');
    expect(body.mensaje).not.toContain('10.0.0.5');
    expect(body.referencia).toEqual(expect.any(String));
  });
});
