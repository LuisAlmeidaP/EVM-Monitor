import { DomainException } from '../../exceptions/domain.exception';

export class InvalidProjectNameException extends DomainException {
  constructor() {
    super('El nombre del proyecto no puede estar vacío.');
  }
}
