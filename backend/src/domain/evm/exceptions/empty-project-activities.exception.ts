import { DomainException } from '../../exceptions/domain.exception';

export class EmptyProjectActivitiesException extends DomainException {
  constructor() {
    super(
      'No es posible calcular el análisis consolidado de un proyecto sin actividades registradas.',
    );
  }
}
