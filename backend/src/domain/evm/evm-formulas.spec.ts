import { ActivityProgressData } from './activity-progress-data';
import {
  computeIndicatorsFromTotals,
  derivePlannedAndEarnedValue,
} from './evm-formulas';

describe('derivePlannedAndEarnedValue', () => {
  it('derives PV and EV as the planned/actual percentage applied to BAC', () => {
    const data = ActivityProgressData.create({
      bac: 100_000,
      plannedPercentage: 50,
      actualPercentage: 40,
      actualCost: 50_000,
    });

    expect(derivePlannedAndEarnedValue(data)).toEqual({
      pv: 50_000,
      ev: 40_000,
    });
  });

  it('derives zero EV when the actual percentage is zero (edge case)', () => {
    const data = ActivityProgressData.create({
      bac: 100_000,
      plannedPercentage: 50,
      actualPercentage: 0,
      actualCost: 10_000,
    });

    expect(derivePlannedAndEarnedValue(data).ev).toBe(0);
  });
});

describe('computeIndicatorsFromTotals', () => {
  it('computes every indicator for the standard example from the EVM methodology', () => {
    const indicators = computeIndicatorsFromTotals(
      100_000,
      50_000,
      40_000,
      50_000,
    );

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

  it('returns cpi and eac as null when actual cost (AC) is zero (edge case)', () => {
    const indicators = computeIndicatorsFromTotals(100_000, 50_000, 40_000, 0);

    expect(indicators.cv).toBe(40_000);
    expect(indicators.cpi).toBeNull();
    expect(indicators.eac).toBeNull();
    expect(indicators.vac).toBeNull();
  });

  it('returns spi as null when planned value (PV) is zero (edge case)', () => {
    const indicators = computeIndicatorsFromTotals(100_000, 0, 40_000, 50_000);

    expect(indicators.sv).toBe(40_000);
    expect(indicators.spi).toBeNull();
  });

  it('returns eac and vac as null when CPI is zero, even though AC is not zero (edge case)', () => {
    const indicators = computeIndicatorsFromTotals(100_000, 50_000, 0, 10_000);

    expect(indicators.cpi).toBe(0);
    expect(indicators.eac).toBeNull();
    expect(indicators.vac).toBeNull();
  });

  it('resolves every indicator to zero or a defined status when nothing has been spent nor advanced', () => {
    const indicators = computeIndicatorsFromTotals(100_000, 0, 0, 0);

    expect(indicators.pv).toBe(0);
    expect(indicators.ev).toBe(0);
    expect(indicators.cv).toBe(0);
    expect(indicators.sv).toBe(0);
    expect(indicators.cpi).toBeNull();
    expect(indicators.spi).toBeNull();
    expect(indicators.eac).toBeNull();
    expect(indicators.vac).toBeNull();
  });
});
