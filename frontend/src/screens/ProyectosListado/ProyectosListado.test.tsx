import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { ProyectosListado } from './ProyectosListado';
import { proyectosApi } from '../../api/proyectosApi';
import { ApiError } from '../../api/apiError';
import type { Proyecto } from '../../types/proyecto';

function renderConRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

vi.mock('../../api/proyectosApi', () => ({
  proyectosApi: {
    listar: vi.fn(),
    obtener: vi.fn(),
    crear: vi.fn(),
    editar: vi.fn(),
    eliminar: vi.fn(),
  },
}));

const proyectosApiMock = vi.mocked(proyectosApi);

const proyectoExistente: Proyecto = { id: '1', nombre: 'Torre Norte' };

describe('ProyectosListado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state while fetching and then renders the list', async () => {
    proyectosApiMock.listar.mockResolvedValue([proyectoExistente]);

    renderConRouter(<ProyectosListado />);

    expect(screen.getByText('Cargando proyectos...')).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByText('Cargando proyectos...'));
    expect(screen.getByText('Torre Norte')).toBeInTheDocument();
  });

  it('shows an error message when loading the list fails', async () => {
    proyectosApiMock.listar.mockRejectedValue(
      new ApiError(500, { categoria: 'inesperado', mensaje: 'Ocurrió un error inesperado.', referencia: 'x' }),
    );

    renderConRouter(<ProyectosListado />);

    expect(await screen.findByText('Ocurrió un error inesperado.')).toBeInTheDocument();
  });

  it('creates a project and refreshes the list', async () => {
    proyectosApiMock.listar
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([proyectoExistente]);
    proyectosApiMock.crear.mockResolvedValue(proyectoExistente);
    const usuario = userEvent.setup();

    renderConRouter(<ProyectosListado />);
    await screen.findByText('No hay proyectos registrados todavía.');

    await usuario.click(screen.getByRole('button', { name: 'Crear proyecto' }));
    await usuario.type(screen.getByLabelText('Nombre del proyecto'), 'Torre Norte');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(proyectosApiMock.crear).toHaveBeenCalledWith('Torre Norte'));
    expect(await screen.findByText('Torre Norte')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nombre del proyecto')).not.toBeInTheDocument();
  });

  it('fetches the latest project data before opening the edit form', async () => {
    const proyectoActualizado: Proyecto = { id: '1', nombre: 'Torre Norte Actualizada' };
    proyectosApiMock.listar.mockResolvedValue([proyectoExistente]);
    proyectosApiMock.obtener.mockResolvedValue(proyectoActualizado);
    const usuario = userEvent.setup();

    renderConRouter(<ProyectosListado />);
    await screen.findByText('Torre Norte');

    await usuario.click(screen.getByRole('button', { name: 'Editar' }));

    expect(proyectosApiMock.obtener).toHaveBeenCalledWith('1');
    expect(await screen.findByLabelText('Nombre del proyecto')).toHaveValue(
      'Torre Norte Actualizada',
    );
  });

  it('edits a project and refreshes the list', async () => {
    proyectosApiMock.listar
      .mockResolvedValueOnce([proyectoExistente])
      .mockResolvedValueOnce([{ id: '1', nombre: 'Torre Sur' }]);
    proyectosApiMock.obtener.mockResolvedValue(proyectoExistente);
    proyectosApiMock.editar.mockResolvedValue({ id: '1', nombre: 'Torre Sur' });
    const usuario = userEvent.setup();

    renderConRouter(<ProyectosListado />);
    await screen.findByText('Torre Norte');

    await usuario.click(screen.getByRole('button', { name: 'Editar' }));
    const input = await screen.findByLabelText('Nombre del proyecto');
    await usuario.clear(input);
    await usuario.type(input, 'Torre Sur');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(proyectosApiMock.editar).toHaveBeenCalledWith('1', 'Torre Sur'));
    expect(await screen.findByText('Torre Sur')).toBeInTheDocument();
  });

  it('deletes a project after confirming in the dialog and refreshes the list', async () => {
    proyectosApiMock.listar.mockResolvedValueOnce([proyectoExistente]).mockResolvedValueOnce([]);
    proyectosApiMock.eliminar.mockResolvedValue(undefined);
    const usuario = userEvent.setup();

    renderConRouter(<ProyectosListado />);
    await screen.findByText('Torre Norte');

    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Eliminar proyecto' }));

    await waitFor(() => expect(proyectosApiMock.eliminar).toHaveBeenCalledWith('1'));
    expect(await screen.findByText('No hay proyectos registrados todavía.')).toBeInTheDocument();
    expect(await screen.findByText('Proyecto eliminado correctamente.')).toBeInTheDocument();
  });

  it('does not delete when the user cancels the confirmation dialog (edge case)', async () => {
    proyectosApiMock.listar.mockResolvedValue([proyectoExistente]);
    const usuario = userEvent.setup();

    renderConRouter(<ProyectosListado />);
    await screen.findByText('Torre Norte');

    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(proyectosApiMock.eliminar).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows an error message when deleting fails', async () => {
    proyectosApiMock.listar.mockResolvedValue([proyectoExistente]);
    proyectosApiMock.eliminar.mockRejectedValue(
      new ApiError(404, { categoria: 'no_encontrado', mensaje: 'El proyecto no existe.', referencia: 'x' }),
    );
    const usuario = userEvent.setup();

    renderConRouter(<ProyectosListado />);
    await screen.findByText('Torre Norte');

    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
    await usuario.click(screen.getByRole('button', { name: 'Eliminar proyecto' }));

    expect(await screen.findByText('El proyecto no existe.')).toBeInTheDocument();
  });

  it('shows a success toast after creating a project', async () => {
    proyectosApiMock.listar.mockResolvedValueOnce([]).mockResolvedValueOnce([proyectoExistente]);
    proyectosApiMock.crear.mockResolvedValue(proyectoExistente);
    const usuario = userEvent.setup();

    renderConRouter(<ProyectosListado />);
    await screen.findByText('No hay proyectos registrados todavía.');

    await usuario.click(screen.getByRole('button', { name: 'Crear proyecto' }));
    await usuario.type(screen.getByLabelText('Nombre del proyecto'), 'Torre Norte');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Proyecto creado correctamente.')).toBeInTheDocument();
  });
});
