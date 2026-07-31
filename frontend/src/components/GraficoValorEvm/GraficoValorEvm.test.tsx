import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraficoValorEvm } from './GraficoValorEvm';
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

describe('GraficoValorEvm', () => {
  it('renders one bar for each of PV, EV and AC', async () => {
    const { container } = render(<GraficoValorEvm analisis={BASE} />);

    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(3),
    );
    expect(within(container).getByText('PV')).toBeInTheDocument();
    expect(within(container).getByText('EV')).toBeInTheDocument();
    expect(within(container).getByText('AC')).toBeInTheDocument();
  });

  it('renders the BAC reference line and its legend entry', () => {
    const { container } = render(<GraficoValorEvm analisis={BASE} />);

    expect(container.querySelector('.recharts-reference-line')).not.toBeNull();
    expect(screen.getByText('Presupuesto total (BAC)')).toBeInTheDocument();
  });

  it('extends the axis domain so the BAC reference line stays visible even when it exceeds the bars (edge case)', () => {
    const analisisConBacAlto: AnalisisEvmActividad = {
      ...BASE,
      datosAvance: { ...BASE.datosAvance, bac: 500_000 },
    };

    const { container } = render(<GraficoValorEvm analisis={analisisConBacAlto} />);

    expect(container.querySelector('.recharts-reference-line-line')).not.toBeNull();
  });
});
