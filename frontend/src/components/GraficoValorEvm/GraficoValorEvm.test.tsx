import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraficoValorEvm } from './GraficoValorEvm';

const BASE = {
  pv: 50_000,
  ev: 40_000,
  ac: 50_000,
  bac: 100_000,
  estadoCosto: 'sobre_presupuesto' as const,
  estadoCronograma: 'atrasado' as const,
};

describe('GraficoValorEvm', () => {
  it('renders one bar for each of PV, EV and AC', async () => {
    const { container } = render(<GraficoValorEvm {...BASE} />);

    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(3),
    );
    expect(within(container).getByText('PV')).toBeInTheDocument();
    expect(within(container).getByText('EV')).toBeInTheDocument();
    expect(within(container).getByText('AC')).toBeInTheDocument();
  });

  it('renders the BAC reference line and its legend entry', () => {
    const { container } = render(<GraficoValorEvm {...BASE} />);

    expect(container.querySelector('.recharts-reference-line')).not.toBeNull();
    expect(screen.getByText('Presupuesto total (BAC)')).toBeInTheDocument();
  });

  it('extends the axis domain so the BAC reference line stays visible even when it exceeds the bars (edge case)', () => {
    const { container } = render(<GraficoValorEvm {...BASE} bac={500_000} />);

    expect(container.querySelector('.recharts-reference-line-line')).not.toBeNull();
  });
});
