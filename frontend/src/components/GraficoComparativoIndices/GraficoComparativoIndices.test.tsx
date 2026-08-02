import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraficoComparativoIndices } from './GraficoComparativoIndices';

describe('GraficoComparativoIndices', () => {
  it('renders one bar per available index (CPI and SPI)', async () => {
    const { container } = render(<GraficoComparativoIndices cpi={0.8} spi={0.8} />);

    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(2),
    );
    expect(within(container).getByText('CPI')).toBeInTheDocument();
    expect(within(container).getByText('SPI')).toBeInTheDocument();
  });

  it('renders the target reference line at the 1.00 mark', () => {
    const { container } = render(<GraficoComparativoIndices cpi={0.8} spi={0.8} />);

    expect(container.querySelector('.recharts-reference-line')).not.toBeNull();
    expect(screen.getByText('Meta 1.00')).toBeInTheDocument();
  });

  it('renders only the available bar when one index is indeterminate (edge case)', async () => {
    const { container } = render(<GraficoComparativoIndices cpi={null} spi={0.8} />);

    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(1),
    );
    expect(within(container).getByText('SPI')).toBeInTheDocument();
    expect(within(container).queryByText('CPI')).not.toBeInTheDocument();
  });

  it('renders a fallback message instead of a chart when both indices are indeterminate (edge case)', () => {
    const { container } = render(<GraficoComparativoIndices cpi={null} spi={null} />);

    expect(
      screen.getByText('Aún no hay datos suficientes para comparar CPI y SPI contra la meta.'),
    ).toBeInTheDocument();
    expect(container.querySelector('.recharts-wrapper')).toBeNull();
  });
});
