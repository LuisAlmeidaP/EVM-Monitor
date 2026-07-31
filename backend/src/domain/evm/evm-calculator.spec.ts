import { ActivityProgressData } from './activity-progress-data';
import { EvmCalculator } from './evm-calculator';

describe('EvmCalculator', () => {
  let calculator: EvmCalculator;

  beforeEach(() => {
    calculator = new EvmCalculator();
  });

  it('calculates every EVM indicator for a standard activity', () => {
    const activity = ActivityProgressData.create({
      bac: 100_000,
      plannedPercentage: 50,
      actualPercentage: 40,
      actualCost: 50_000,
    });

    expect(calculator.calculate(activity)).toEqual({
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

  it('returns cpi, eac and vac as null when the actual cost is zero (edge case)', () => {
    const activity = ActivityProgressData.create({
      bac: 100_000,
      plannedPercentage: 50,
      actualPercentage: 40,
      actualCost: 0,
    });

    const indicators = calculator.calculate(activity);

    expect(indicators.cpi).toBeNull();
    expect(indicators.eac).toBeNull();
    expect(indicators.vac).toBeNull();
  });

  it('returns ev, cv, sv and cpi as zero-consistent values when actual progress is zero (edge case)', () => {
    const activity = ActivityProgressData.create({
      bac: 100_000,
      plannedPercentage: 50,
      actualPercentage: 0,
      actualCost: 10_000,
    });

    const indicators = calculator.calculate(activity);

    expect(indicators.ev).toBe(0);
    expect(indicators.cv).toBe(-10_000);
    expect(indicators.sv).toBe(-50_000);
    expect(indicators.cpi).toBe(0);
    expect(indicators.eac).toBeNull();
  });

  it('performs favorably when CPI and SPI are greater than 1', () => {
    const activity = ActivityProgressData.create({
      bac: 100_000,
      plannedPercentage: 40,
      actualPercentage: 50,
      actualCost: 40_000,
    });

    const indicators = calculator.calculate(activity);

    expect(indicators.cpi).toBeGreaterThan(1);
    expect(indicators.spi).toBeGreaterThan(1);
  });
});
