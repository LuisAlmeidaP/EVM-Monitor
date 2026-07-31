import { DomainException } from '../../exceptions/domain.exception';

export class InvalidActivityProgressDataException extends DomainException {
  constructor(details: string[]) {
    super('Los datos de avance de la actividad no son válidos.', details);
  }
}
