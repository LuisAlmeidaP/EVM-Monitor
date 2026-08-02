import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { TooltipContentProps } from 'recharts';
import { GraficoComparativoActividades, TooltipComparativa } from './GraficoComparativoActividades';
import type { ActividadComparativaEvm } from '../../types/analisisEvm';

function propsTooltip(props: Partial<TooltipContentProps>): TooltipContentProps {
  return props as TooltipContentProps;
}

const EXCAVACION: ActividadComparativaEvm = {
  id: 'a1',
  nombre: 'Excavación',
  pv: 50_000,
  ev: 40_000,
  ac: 60_000,
  cv: -20_000,
  sv: -10_000,
  estadoGeneral: 'critico',
};

const CIMENTACION: ActividadComparativaEvm = {
  id: 'a2',
  nombre: 'Cimentación',
  pv: 60_000,
  ev: 70_000,
  ac: 65_000,
  cv: 5_000,
  sv: 10_000,
  estadoGeneral: 'saludable',
};

const actividades = [EXCAVACION, CIMENTACION];

describe('GraficoComparativoActividades', () => {
  it('renders one row (three bars) per activity, labeled on the category axis', async () => {
    const { container } = render(<GraficoComparativoActividades actividades={actividades} />);

    expect(within(container).getByText('Excavación')).toBeInTheDocument();
    expect(within(container).getByText('Cimentación')).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-bar-rectangle')).toHaveLength(6),
    );
  });

  it('renders a legend identifying PV, EV and AC', () => {
    render(<GraficoComparativoActividades actividades={actividades} />);

    expect(screen.getByText(/PV — Valor planificado/)).toBeInTheDocument();
    expect(screen.getByText(/EV — Valor ganado/)).toBeInTheDocument();
    expect(screen.getByText(/AC — Costo real/)).toBeInTheDocument();
  });

  it('adapts its height to the number of activities (responsive to data size)', () => {
    const { container: pocasActividades } = render(
      <GraficoComparativoActividades actividades={[EXCAVACION]} />,
    );
    const { container: muchasActividades } = render(
      <GraficoComparativoActividades
        actividades={Array.from({ length: 10 }, (_, indice) => ({
          ...EXCAVACION,
          id: `a${indice}`,
          nombre: `Actividad ${indice}`,
        }))}
      />,
    );

    const alturaPocas = Number(pocasActividades.querySelector('.recharts-wrapper')?.getAttribute('height'));
    const alturaMuchas = Number(
      muchasActividades.querySelector('.recharts-wrapper')?.getAttribute('height'),
    );

    expect(alturaMuchas).toBeGreaterThan(alturaPocas);
  });

  it('reorders activities by largest deviation first when requested', async () => {
    const usuario = userEvent.setup();
    const { container } = render(<GraficoComparativoActividades actividades={actividades} />);

    await usuario.selectOptions(screen.getByLabelText('Ordenar por'), 'Mayor desviación primero');

    await waitFor(() => {
      const etiquetas = Array.from(container.querySelectorAll('.recharts-yAxis-tick-labels tspan')).map(
        (nodo) => nodo.textContent,
      );
      // Excavación (|cv|+|sv|=30000) desvía más que Cimentación (|cv|+|sv|=15000)
      expect(etiquetas[0]).toBe('Excavación');
    });
  });

  it('renders a fallback message when there are no activities yet (edge case)', () => {
    const { container } = render(<GraficoComparativoActividades actividades={[]} />);

    expect(
      screen.getByText('Aún no hay actividades registradas para comparar PV, EV y AC.'),
    ).toBeInTheDocument();
    expect(container.querySelector('.recharts-wrapper')).toBeNull();
  });

  it('shows a rich tooltip with PV, EV, AC and the overall status for the given activity', () => {
    render(
      <TooltipComparativa
        {...propsTooltip({
          active: true,
          payload: [{ payload: EXCAVACION, value: EXCAVACION.pv, dataKey: 'pv' }] as never,
        })}
      />,
    );

    expect(screen.getByText('Excavación')).toBeInTheDocument();
    expect(screen.getByText('PV: 50.000')).toBeInTheDocument();
    expect(screen.getByText('EV: 40.000')).toBeInTheDocument();
    expect(screen.getByText('AC: 60.000')).toBeInTheDocument();
    expect(screen.getByText('Crítico')).toBeInTheDocument();
  });

  it('renders nothing when the tooltip is inactive (edge case)', () => {
    const { container } = render(
      <TooltipComparativa {...propsTooltip({ active: false, payload: [] })} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
