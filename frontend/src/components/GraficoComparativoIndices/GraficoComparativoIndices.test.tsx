import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraficoComparativoIndices } from './GraficoComparativoIndices';
import type { AnalisisEvmActividad } from '../../types/analisisEvm';

const BASE: AnalisisEvmActividad = {
  actividadId: 'a1',
  proyectoId: 'p1',
  nombre: 'Excavación',
  datosAvance: { bac: 100_000, porcentajeAvancePlanificado: 50, porcentajeAvanceReal: 40, costoReal: 50_000 },
  indicadores: { pv: 50_000, ev: 40_000, cv: -10_000, sv: -10_000, cpi: 0.8, spi: 0.8, eac: 125_000, vac: -25_000 },
  interpretacion: { estadoCosto: 'sobre_presupuesto', estadoCronograma: 'atrasado' },
  estadoGeneral: 'critico',
};

describe('GraficoComparativoIndices', () => {
  it('renders one bar per available index (CPI and SPI)', async () => {
    const { container } = render(<GraficoComparativoIndices analisis={BASE} />);

    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(2),
    );
    expect(within(container).getByText('CPI')).toBeInTheDocument();
    expect(within(container).getByText('SPI')).toBeInTheDocument();
  });

  it('renders the target reference line at the 1.00 mark', () => {
    const { container } = render(<GraficoComparativoIndices analisis={BASE} />);

    expect(container.querySelector('.recharts-reference-line')).not.toBeNull();
    expect(screen.getByText('Meta 1.00')).toBeInTheDocument();
  });

  it('renders only the available bar when one index is indeterminate (edge case)', async () => {
    const analisisParcial: AnalisisEvmActividad = {
      ...BASE,
      indicadores: { ...BASE.indicadores, cpi: null },
    };

    const { container } = render(<GraficoComparativoIndices analisis={analisisParcial} />);

    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(1),
    );
    expect(within(container).getByText('SPI')).toBeInTheDocument();
    expect(within(container).queryByText('CPI')).not.toBeInTheDocument();
  });

  it('renders a fallback message instead of a chart when both indices are indeterminate (edge case)', () => {
    const analisisSinDatos: AnalisisEvmActividad = {
      ...BASE,
      indicadores: { ...BASE.indicadores, cpi: null, spi: null },
    };

    const { container } = render(<GraficoComparativoIndices analisis={analisisSinDatos} />);

    expect(
      screen.getByText('Aún no hay datos suficientes para comparar CPI y SPI contra la meta.'),
    ).toBeInTheDocument();
    expect(container.querySelector('.recharts-wrapper')).toBeNull();
  });
});
