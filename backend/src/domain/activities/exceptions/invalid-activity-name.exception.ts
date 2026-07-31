import { DomainException } from '../../exceptions/domain.exception';

export class InvalidActivityNameException extends DomainException {
  constructor() {
    super('El nombre de la actividad no puede estar vacío.');
  }
}
