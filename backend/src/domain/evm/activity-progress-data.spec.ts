import { ActivityProgressData } from './activity-progress-data';
import { InvalidActivityProgressDataException } from './exceptions/invalid-activity-progress-data.exception';

describe('ActivityProgressData', () => {
  it('creates a valid instance when all fields respect the domain rules', () => {
    const data = ActivityProgressData.create({
      bac: 100_000,
      plannedPercentage: 50,
      actualPercentage: 40,
      actualCost: 50_000,
    });

    expect(data.bac).toBe(100_000);
    expect(data.plannedPercentage).toBe(50);
    expect(data.actualPercentage).toBe(40);
    expect(data.actualCost).toBe(50_000);
  });

  it('accepts an actual cost of zero, since it is a valid edge case, not a violation', () => {
    expect(() =>
      ActivityProgressData.create({
        bac: 100_000,
        plannedPercentage: 50,
        actualPercentage: 0,
        actualCost: 0,
      }),
    ).not.toThrow();
  });

  it('accepts percentages at the boundaries 0 and 100', () => {
    expect(() =>
      ActivityProgressData.create({
        bac: 100_000,
        plannedPercentage: 0,
        actualPercentage: 100,
        actualCost: 0,
      }),
    ).not.toThrow();
  });

  it('rejects a negative BAC', () => {
    expect(() =>
      ActivityProgressData.create({
        bac: -1,
        plannedPercentage: 50,
        actualPercentage: 40,
        actualCost: 50_000,
      }),
    ).toThrow(InvalidActivityProgressDataException);
  });

  it('rejects a negative actual cost', () => {
    expect(() =>
      ActivityProgressData.create({
        bac: 100_000,
        plannedPercentage: 50,
        actualPercentage: 40,
        actualCost: -1,
      }),
    ).toThrow(InvalidActivityProgressDataException);
  });

  it('rejects a planned percentage outside the 0-100 range', () => {
    expect(() =>
      ActivityProgressData.create({
        bac: 100_000,
        plannedPercentage: 150,
        actualPercentage: 40,
        actualCost: 50_000,
      }),
    ).toThrow(InvalidActivityProgressDataException);
  });

  it('rejects an actual percentage outside the 0-100 range', () => {
    expect(() =>
      ActivityProgressData.create({
        bac: 100_000,
        plannedPercentage: 50,
        actualPercentage: -10,
        actualCost: 50_000,
      }),
    ).toThrow(InvalidActivityProgressDataException);
  });

  it('collects every violation found, not just the first one', () => {
    expect.assertions(2);

    try {
      ActivityProgressData.create({
        bac: -1,
        plannedPercentage: 150,
        actualPercentage: 40,
        actualCost: 50_000,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidActivityProgressDataException);
      expect(
        (error as InvalidActivityProgressDataException).details,
      ).toHaveLength(2);
    }
  });
});
