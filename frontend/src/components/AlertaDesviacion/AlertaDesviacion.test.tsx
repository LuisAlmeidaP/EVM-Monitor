import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AlertaDesviacion } from './AlertaDesviacion';
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

describe('AlertaDesviacion', () => {
  it('shows a cost overrun alert with the magnitude taken from the already-computed CV', () => {
    render(<AlertaDesviacion analisis={BASE} />);

    expect(screen.getByText(/Sobrecosto: el costo real supera en 10.000/)).toBeInTheDocument();
  });

  it('shows a schedule delay alert with the magnitude taken from the already-computed SV', () => {
    render(<AlertaDesviacion analisis={BASE} />);

    expect(screen.getByText(/Retraso: el avance real equivale a 10.000 menos/)).toBeInTheDocument();
  });

  it('renders nothing when there are no meaningful deviations (edge case)', () => {
    const analisisSaludable: AnalisisEvmActividad = {
      ...BASE,
      interpretacion: { estadoCosto: 'bajo_presupuesto', estadoCronograma: 'adelantado' },
      estadoGeneral: 'saludable',
    };

    const { container } = render(<AlertaDesviacion analisis={analisisSaludable} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows only the cronograma alert when only the schedule is behind (mixed edge case)', () => {
    const analisisMixto: AnalisisEvmActividad = {
      ...BASE,
      interpretacion: { estadoCosto: 'bajo_presupuesto', estadoCronograma: 'atrasado' },
      estadoGeneral: 'en_riesgo',
    };

    render(<AlertaDesviacion analisis={analisisMixto} />);

    expect(screen.queryByText(/Sobrecosto/)).not.toBeInTheDocument();
    expect(screen.getByText(/Retraso/)).toBeInTheDocument();
  });
});
