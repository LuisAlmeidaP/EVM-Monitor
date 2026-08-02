import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { ListadoProyectos } from './ListadoProyectos';
import type { Proyecto } from '../../types/proyecto';

const proyectos: Proyecto[] = [
  { id: '1', nombre: 'Torre Norte' },
  { id: '2', nombre: 'Torre Sur' },
];

function renderConRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ListadoProyectos', () => {
  it('shows a message when there are no projects (edge case)', () => {
    renderConRouter(<ListadoProyectos proyectos={[]} onEditar={vi.fn()} onEliminar={vi.fn()} />);

    expect(screen.getByText('No hay proyectos registrados todavía.')).toBeInTheDocument();
  });

  it('renders one row per project with its name', () => {
    renderConRouter(
      <ListadoProyectos proyectos={proyectos} onEditar={vi.fn()} onEliminar={vi.fn()} />,
    );

    expect(screen.getByText('Torre Norte')).toBeInTheDocument();
    expect(screen.getByText('Torre Sur')).toBeInTheDocument();
  });

  it('calls onEditar with the corresponding project when its Editar button is clicked', async () => {
    const onEditar = vi.fn();
    const usuario = userEvent.setup();
    renderConRouter(
      <ListadoProyectos proyectos={proyectos} onEditar={onEditar} onEliminar={vi.fn()} />,
    );

    await usuario.click(screen.getAllByRole('button', { name: 'Editar' })[0]);

    expect(onEditar).toHaveBeenCalledWith(proyectos[0]);
  });

  it('calls onEliminar with the corresponding project when its Eliminar button is clicked', async () => {
    const onEliminar = vi.fn();
    const usuario = userEvent.setup();
    renderConRouter(
      <ListadoProyectos proyectos={proyectos} onEditar={vi.fn()} onEliminar={onEliminar} />,
    );

    await usuario.click(screen.getAllByRole('button', { name: 'Eliminar' })[1]);

    expect(onEliminar).toHaveBeenCalledWith(proyectos[1]);
  });

  it('links each project card to its dashboard, and offers a secondary link to its activities screen', () => {
    renderConRouter(
      <ListadoProyectos proyectos={proyectos} onEditar={vi.fn()} onEliminar={vi.fn()} />,
    );

    expect(screen.getByRole('link', { name: /Torre Norte/ })).toHaveAttribute(
      'href',
      '/proyectos/1/dashboard',
    );
    expect(screen.getAllByRole('link', { name: 'Ver actividades' })[0]).toHaveAttribute(
      'href',
      '/proyectos/1/actividades',
    );
  });
});
