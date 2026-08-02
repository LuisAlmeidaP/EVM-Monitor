import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AlertaDesviacion } from './AlertaDesviacion';

const BASE = {
  cv: -10_000,
  sv: -10_000,
  estadoCosto: 'sobre_presupuesto' as const,
  estadoCronograma: 'atrasado' as const,
};

describe('AlertaDesviacion', () => {
  it('shows a cost overrun alert with the magnitude taken from the already-computed CV', () => {
    render(<AlertaDesviacion {...BASE} />);

    expect(screen.getByText(/Sobrecosto: el costo real supera en 10.000/)).toBeInTheDocument();
  });

  it('shows a schedule delay alert with the magnitude taken from the already-computed SV', () => {
    render(<AlertaDesviacion {...BASE} />);

    expect(screen.getByText(/Retraso: el avance real equivale a 10.000 menos/)).toBeInTheDocument();
  });

  it('renders nothing when there are no meaningful deviations (edge case)', () => {
    const { container } = render(
      <AlertaDesviacion cv={10_000} sv={10_000} estadoCosto="bajo_presupuesto" estadoCronograma="adelantado" />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows only the cronograma alert when only the schedule is behind (mixed edge case)', () => {
    render(
      <AlertaDesviacion cv={10_000} sv={-10_000} estadoCosto="bajo_presupuesto" estadoCronograma="atrasado" />,
    );

    expect(screen.queryByText(/Sobrecosto/)).not.toBeInTheDocument();
    expect(screen.getByText(/Retraso/)).toBeInTheDocument();
  });
});
