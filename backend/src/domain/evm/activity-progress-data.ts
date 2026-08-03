import { InvalidActivityProgressDataException } from './exceptions/invalid-activity-progress-data.exception';

const MIN_PERCENTAGE = 0;
const MAX_PERCENTAGE = 100;

export interface ActivityProgressDataInput {
  readonly bac: number;
  readonly plannedPercentage: number;
  readonly actualPercentage: number;
  readonly actualCost: number;
}

export class ActivityProgressData {
  private constructor(
    public readonly bac: number,
    public readonly plannedPercentage: number,
    public readonly actualPercentage: number,
    public readonly actualCost: number,
  ) {}

  static create(input: ActivityProgressDataInput): ActivityProgressData {
    const violations = ActivityProgressData.collectViolations(input);

    if (violations.length > 0) {
      throw new InvalidActivityProgressDataException(violations);
    }

    return new ActivityProgressData(
      input.bac,
      input.plannedPercentage,
      input.actualPercentage,
      input.actualCost,
    );
  }

  private static collectViolations(input: ActivityProgressDataInput): string[] {
    const violations: string[] = [];

    if (!ActivityProgressData.isNonNegativeAmount(input.bac)) {
      violations.push(
        'El presupuesto planificado (BAC) debe ser un número mayor o igual a cero.',
      );
    }
    if (!ActivityProgressData.isValidPercentage(input.plannedPercentage)) {
      violations.push(
        'El porcentaje de avance planificado debe estar entre 0 y 100.',
      );
    }
    if (!ActivityProgressData.isValidPercentage(input.actualPercentage)) {
      violations.push('El porcentaje de avance real debe estar entre 0 y 100.');
    }
    if (!ActivityProgressData.isNonNegativeAmount(input.actualCost)) {
      violations.push(
        'El costo real incurrido (AC) debe ser un número mayor o igual a cero.',
      );
    }

    return violations;
  }

  private static isNonNegativeAmount(value: number): boolean {
    return Number.isFinite(value) && value >= 0;
  }

  private static isValidPercentage(value: number): boolean {
    return (
      Number.isFinite(value) &&
      value >= MIN_PERCENTAGE &&
      value <= MAX_PERCENTAGE
    );
  }
}
