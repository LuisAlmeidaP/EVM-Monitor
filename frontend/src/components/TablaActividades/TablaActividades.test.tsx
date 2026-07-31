import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TablaActividades } from './TablaActividades';
import type { Actividad } from '../../types/actividad';

const actividades: Actividad[] = [
  {
    id: '1',
    proyectoId: 'p1',
    nombre: 'Excavación',
    bac: 100_000,
    porcentajeAvancePlanificado: 50,
    porcentajeAvanceReal: 40,
    costoReal: 50_000,
  },
  {
    id: '2',
    proyectoId: 'p1',
    nombre: 'Cimentación',
    bac: 200_000,
    porcentajeAvancePlanificado: 30,
    porcentajeAvanceReal: 20,
    costoReal: 60_000,
  },
];

describe('TablaActividades', () => {
  it('shows a message when there are no activities (edge case)', () => {
    render(<TablaActividades actividades={[]} onEditar={vi.fn()} onEliminar={vi.fn()} />);

    expect(screen.getByText('No hay actividades registradas todavía.')).toBeInTheDocument();
  });

  it('renders one row per activity with its data', () => {
    render(<TablaActividades actividades={actividades} onEditar={vi.fn()} onEliminar={vi.fn()} />);

    expect(screen.getByText('Excavación')).toBeInTheDocument();
    expect(screen.getByText('Cimentación')).toBeInTheDocument();
    expect(screen.getByText('100.000')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('calls onEditar with the corresponding activity when its Editar button is clicked', async () => {
    const onEditar = vi.fn();
    const usuario = userEvent.setup();
    render(<TablaActividades actividades={actividades} onEditar={onEditar} onEliminar={vi.fn()} />);

    await usuario.click(screen.getAllByRole('button', { name: 'Editar' })[0]);

    expect(onEditar).toHaveBeenCalledWith(actividades[0]);
  });

  it('calls onEliminar with the corresponding activity when its Eliminar button is clicked', async () => {
    const onEliminar = vi.fn();
    const usuario = userEvent.setup();
    render(
      <TablaActividades actividades={actividades} onEditar={vi.fn()} onEliminar={onEliminar} />,
    );

    await usuario.click(screen.getAllByRole('button', { name: 'Eliminar' })[1]);

    expect(onEliminar).toHaveBeenCalledWith(actividades[1]);
  });
});
