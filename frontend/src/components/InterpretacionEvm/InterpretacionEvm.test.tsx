import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InterpretacionEvm } from './InterpretacionEvm';

describe('InterpretacionEvm', () => {
  it('renders a plain-language cost overrun message when estadoCosto is sobre_presupuesto', () => {
    render(
      <InterpretacionEvm interpretacion={{ estadoCosto: 'sobre_presupuesto', estadoCronograma: 'a_tiempo' }} />,
    );

    expect(screen.getByText(/gastando más de lo planeado/)).toBeInTheDocument();
  });

  it('renders a plain-language schedule delay message when estadoCronograma is atrasado', () => {
    render(
      <InterpretacionEvm interpretacion={{ estadoCosto: 'en_presupuesto', estadoCronograma: 'atrasado' }} />,
    );

    expect(screen.getByText(/por debajo del avance planificado/)).toBeInTheDocument();
  });

  it('renders positive messages when both cost and schedule are ahead of plan', () => {
    render(
      <InterpretacionEvm interpretacion={{ estadoCosto: 'bajo_presupuesto', estadoCronograma: 'adelantado' }} />,
    );

    expect(screen.getByText(/gastando menos de lo planeado/)).toBeInTheDocument();
    expect(screen.getByText(/supera al avance planificado/)).toBeInTheDocument();
  });

  it('renders "not enough data yet" messages when both statuses are indeterminate (edge case)', () => {
    render(<InterpretacionEvm interpretacion={{ estadoCosto: null, estadoCronograma: null }} />);

    expect(screen.getByText(/costo real registrado es cero/)).toBeInTheDocument();
    expect(screen.getByText(/avance planificado registrado es cero/)).toBeInTheDocument();
  });
});
