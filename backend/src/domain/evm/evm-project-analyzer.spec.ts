import { ActivityProgressData } from './activity-progress-data';
import { EmptyProjectActivitiesException } from './exceptions/empty-project-activities.exception';
import { EvmProjectAnalyzer } from './evm-project-analyzer';

function crearDatos(
  overrides: Partial<{
    bac: number;
    plannedPercentage: number;
    actualPercentage: number;
    actualCost: number;
  }> = {},
): ActivityProgressData {
  return ActivityProgressData.create({
    bac: 100_000,
    plannedPercentage: 50,
    actualPercentage: 50,
    actualCost: 50_000,
    ...overrides,
  });
}

describe('EvmProjectAnalyzer', () => {
  let analyzer: EvmProjectAnalyzer;

  beforeEach(() => {
    analyzer = new EvmProjectAnalyzer();
  });

  it('reuses the F4 consolidator to sum base values and recompute ratios over the totals', () => {
    const actividadA = crearDatos({
      bac: 100_000,
      plannedPercentage: 50,
      actualPercentage: 40,
      actualCost: 50_000,
    });
    const actividadB = crearDatos({
      bac: 200_000,
      plannedPercentage: 30,
      actualPercentage: 35,
      actualCost: 65_000,
    });

    const { indicators } = analyzer.analyze([actividadA, actividadB]);

    // pv = 50000 + 60000 = 110000; ev = 40000 + 70000 = 110000
    expect(indicators).toEqual({
      pv: 110_000,
      ev: 110_000,
      cv: -5_000,
      sv: 0,
      cpi: 110_000 / 115_000,
      spi: 1,
      eac: 300_000 / (110_000 / 115_000),
      vac: 300_000 - 300_000 / (110_000 / 115_000),
    });
  });

  it('throws EmptyProjectActivitiesException when the project has no activities (edge case)', () => {
    expect(() => analyzer.analyze([])).toThrow(EmptyProjectActivitiesException);
  });

  it('marks the project as "saludable" when the consolidated cost and schedule are on or ahead of plan', () => {
    const actividad = crearDatos({ actualPercentage: 60, actualCost: 50_000 });

    const { interpretation, overallStatus } = analyzer.analyze([actividad]);

    expect(interpretation.costStatus).toBe('bajo_presupuesto');
    expect(interpretation.scheduleStatus).toBe('adelantado');
    expect(overallStatus).toBe('saludable');
  });

  it('marks the project as "critico" when the consolidated cost and schedule are both behind plan', () => {
    const actividad = crearDatos({ actualPercentage: 30, actualCost: 60_000 });

    const { interpretation, overallStatus } = analyzer.analyze([actividad]);

    expect(interpretation.costStatus).toBe('sobre_presupuesto');
    expect(interpretation.scheduleStatus).toBe('atrasado');
    expect(overallStatus).toBe('critico');
  });

  it('returns a null overall status when the consolidated AC is zero, since CPI is indeterminate (edge case)', () => {
    const actividad = crearDatos({ actualPercentage: 0, actualCost: 0 });

    const { indicators, overallStatus } = analyzer.analyze([actividad]);

    expect(indicators.cpi).toBeNull();
    expect(overallStatus).toBeNull();
  });
});
