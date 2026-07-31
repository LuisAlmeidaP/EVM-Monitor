import { ActivityProgressData } from './activity-progress-data';
import { EvmAnalyzer } from './evm-analyzer';

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

describe('EvmAnalyzer', () => {
  let analyzer: EvmAnalyzer;

  beforeEach(() => {
    analyzer = new EvmAnalyzer();
  });

  it('reuses the F4 calculator to produce indicators matching the known EVM formulas', () => {
    const data = crearDatos({
      bac: 100_000,
      plannedPercentage: 50,
      actualPercentage: 40,
      actualCost: 50_000,
    });

    const { indicators } = analyzer.analyze(data);

    expect(indicators).toEqual({
      pv: 50_000,
      ev: 40_000,
      cv: -10_000,
      sv: -10_000,
      cpi: 0.8,
      spi: 0.8,
      eac: 125_000,
      vac: -25_000,
    });
  });

  it('marks the activity as "saludable" when both cost and schedule are on or ahead of plan', () => {
    const data = crearDatos({ actualPercentage: 60, actualCost: 50_000 });

    const { interpretation, overallStatus } = analyzer.analyze(data);

    expect(interpretation.costStatus).toBe('bajo_presupuesto');
    expect(interpretation.scheduleStatus).toBe('adelantado');
    expect(overallStatus).toBe('saludable');
  });

  it('marks the activity as "critico" when both cost and schedule are behind plan', () => {
    const data = crearDatos({ actualPercentage: 30, actualCost: 60_000 });

    const { interpretation, overallStatus } = analyzer.analyze(data);

    expect(interpretation.costStatus).toBe('sobre_presupuesto');
    expect(interpretation.scheduleStatus).toBe('atrasado');
    expect(overallStatus).toBe('critico');
  });

  it('marks the activity as "en_riesgo" when only one of cost or schedule is behind plan (mixed edge case)', () => {
    const data = crearDatos({ actualPercentage: 30, actualCost: 20_000 });

    const { interpretation, overallStatus } = analyzer.analyze(data);

    expect(interpretation.costStatus).toBe('bajo_presupuesto');
    expect(interpretation.scheduleStatus).toBe('atrasado');
    expect(overallStatus).toBe('en_riesgo');
  });

  it('returns a null overall status when AC is zero, since CPI is indeterminate (edge case)', () => {
    const data = crearDatos({ actualPercentage: 0, actualCost: 0 });

    const { indicators, interpretation, overallStatus } =
      analyzer.analyze(data);

    expect(indicators.cpi).toBeNull();
    expect(interpretation.costStatus).toBeNull();
    expect(overallStatus).toBeNull();
  });

  it('returns a null overall status when the planned percentage is zero, since SPI is indeterminate (edge case)', () => {
    const data = crearDatos({
      plannedPercentage: 0,
      actualPercentage: 0,
      actualCost: 10_000,
    });

    const { indicators, overallStatus } = analyzer.analyze(data);

    expect(indicators.spi).toBeNull();
    expect(overallStatus).toBeNull();
  });
});
