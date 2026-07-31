import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ListadoProyectos } from './ListadoProyectos';
import type { Proyecto } from '../../types/proyecto';

const proyectos: Proyecto[] = [
  { id: '1', nombre: 'Torre Norte' },
  { id: '2', nombre: 'Torre Sur' },
];

describe('ListadoProyectos', () => {
  it('shows a message when there are no projects (edge case)', () => {
    render(<ListadoProyectos proyectos={[]} onEditar={vi.fn()} onEliminar={vi.fn()} />);

    expect(screen.getByText('No hay proyectos registrados todavía.')).toBeInTheDocument();
  });

  it('renders one row per project with its name', () => {
    render(<ListadoProyectos proyectos={proyectos} onEditar={vi.fn()} onEliminar={vi.fn()} />);

    expect(screen.getByText('Torre Norte')).toBeInTheDocument();
    expect(screen.getByText('Torre Sur')).toBeInTheDocument();
  });

  it('calls onEditar with the corresponding project when its Editar button is clicked', async () => {
    const onEditar = vi.fn();
    const usuario = userEvent.setup();
    render(<ListadoProyectos proyectos={proyectos} onEditar={onEditar} onEliminar={vi.fn()} />);

    await usuario.click(screen.getAllByRole('button', { name: 'Editar' })[0]);

    expect(onEditar).toHaveBeenCalledWith(proyectos[0]);
  });

  it('calls onEliminar with the corresponding project when its Eliminar button is clicked', async () => {
    const onEliminar = vi.fn();
    const usuario = userEvent.setup();
    render(<ListadoProyectos proyectos={proyectos} onEditar={vi.fn()} onEliminar={onEliminar} />);

    await usuario.click(screen.getAllByRole('button', { name: 'Eliminar' })[1]);

    expect(onEliminar).toHaveBeenCalledWith(proyectos[1]);
  });
});
