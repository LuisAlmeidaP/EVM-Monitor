import { ActivityProgressData } from './activity-progress-data';
import { EvmConsolidator } from './evm-consolidator';
import { EmptyProjectActivitiesException } from './exceptions/empty-project-activities.exception';

describe('EvmConsolidator', () => {
  let consolidator: EvmConsolidator;

  beforeEach(() => {
    consolidator = new EvmConsolidator();
  });

  it('throws EmptyProjectActivitiesException when there are no activities to consolidate (edge case)', () => {
    expect(() => consolidator.consolidate([])).toThrow(
      EmptyProjectActivitiesException,
    );
  });

  it('behaves like a single-activity calculation when the project has only one activity', () => {
    const activity = ActivityProgressData.create({
      bac: 100_000,
      plannedPercentage: 50,
      actualPercentage: 40,
      actualCost: 50_000,
    });

    expect(consolidator.consolidate([activity])).toEqual({
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

  it('sums the base values of every activity before recalculating the ratios (PMI rollup method)', () => {
    const activityA = ActivityProgressData.create({
      bac: 100_000,
      plannedPercentage: 50,
      actualPercentage: 40,
      actualCost: 50_000,
    });
    const activityB = ActivityProgressData.create({
      bac: 200_000,
      plannedPercentage: 30,
      actualPercentage: 30,
      actualCost: 60_000,
    });

    const indicators = consolidator.consolidate([activityA, activityB]);

    // PV: 50_000 + 60_000 = 110_000 · EV: 40_000 + 60_000 = 100_000 · AC: 50_000 + 60_000 = 110_000
    expect(indicators.pv).toBe(110_000);
    expect(indicators.ev).toBe(100_000);
    expect(indicators.cv).toBeCloseTo(-10_000);
    expect(indicators.sv).toBeCloseTo(-10_000);
  });

  it('returns cpi and eac as null when every activity has an actual cost of zero (edge case)', () => {
    const activityA = ActivityProgressData.create({
      bac: 100_000,
      plannedPercentage: 50,
      actualPercentage: 40,
      actualCost: 0,
    });
    const activityB = ActivityProgressData.create({
      bac: 50_000,
      plannedPercentage: 20,
      actualPercentage: 10,
      actualCost: 0,
    });

    const indicators = consolidator.consolidate([activityA, activityB]);

    expect(indicators.cpi).toBeNull();
    expect(indicators.eac).toBeNull();
  });
});
