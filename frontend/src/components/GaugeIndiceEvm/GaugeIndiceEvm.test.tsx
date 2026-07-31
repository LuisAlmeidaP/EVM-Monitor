import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GaugeIndiceEvm } from './GaugeIndiceEvm';

describe('GaugeIndiceEvm', () => {
  it('renders the formatted index value and the target inside the gauge', async () => {
    const { container } = render(
      <GaugeIndiceEvm etiqueta="CPI" descripcion="Eficiencia de costo" valor={0.8} />,
    );

    expect(screen.getByText('0,80')).toBeInTheDocument();
    expect(screen.getByText('Meta: 1,00')).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector('.recharts-wrapper')).not.toBeNull());
  });

  it('renders "N/D" and no chart when the value is indeterminate (edge case)', () => {
    const { container } = render(
      <GaugeIndiceEvm etiqueta="SPI" descripcion="Eficiencia de cronograma" valor={null} />,
    );

    expect(screen.getByText('N/D')).toBeInTheDocument();
    expect(screen.getByText('Datos insuficientes')).toBeInTheDocument();
    expect(container.querySelector('.recharts-wrapper')).toBeNull();
  });

  it('renders a value above the target with the correct index formatting', () => {
    render(<GaugeIndiceEvm etiqueta="CPI" descripcion="Eficiencia de costo" valor={1.6} />);

    expect(screen.getByText('1,60')).toBeInTheDocument();
  });
});
