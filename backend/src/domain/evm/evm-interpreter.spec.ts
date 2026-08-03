import { EvmInterpreter } from './evm-interpreter';

describe('EvmInterpreter', () => {
  let interpreter: EvmInterpreter;

  beforeEach(() => {
    interpreter = new EvmInterpreter();
  });

  it.each([
    [1.2, 'bajo_presupuesto'],
    [0.8, 'sobre_presupuesto'],
    [1, 'en_presupuesto'],
  ] as const)('interprets a CPI of %p as "%s"', (cpi, expectedStatus) => {
    expect(interpreter.interpret(cpi, 1).costStatus).toBe(expectedStatus);
  });

  it.each([
    [1.2, 'adelantado'],
    [0.8, 'atrasado'],
    [1, 'a_tiempo'],
  ] as const)('interprets an SPI of %p as "%s"', (spi, expectedStatus) => {
    expect(interpreter.interpret(1, spi).scheduleStatus).toBe(expectedStatus);
  });

  it('returns null for both statuses when CPI and SPI are indeterminate (edge case)', () => {
    const interpretation = interpreter.interpret(null, null);

    expect(interpretation.costStatus).toBeNull();
    expect(interpretation.scheduleStatus).toBeNull();
  });
});
