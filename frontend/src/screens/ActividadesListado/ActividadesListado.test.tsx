import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActividadesListado } from './ActividadesListado';
import { actividadesApi } from '../../api/actividadesApi';
import { proyectosApi } from '../../api/proyectosApi';
import { ApiError } from '../../api/apiError';
import type { Actividad } from '../../types/actividad';
import type { Proyecto } from '../../types/proyecto';

vi.mock('../../api/actividadesApi', () => ({
  actividadesApi: {
    listarPorProyecto: vi.fn(),
    obtener: vi.fn(),
    crear: vi.fn(),
    editar: vi.fn(),
    eliminar: vi.fn(),
  },
}));

vi.mock('../../api/proyectosApi', () => ({
  proyectosApi: {
    listar: vi.fn(),
    obtener: vi.fn(),
    crear: vi.fn(),
    editar: vi.fn(),
    eliminar: vi.fn(),
  },
}));

const actividadesApiMock = vi.mocked(actividadesApi);
const proyectosApiMock = vi.mocked(proyectosApi);

const proyecto: Proyecto = { id: 'p1', nombre: 'Torre Norte' };
const actividadExistente: Actividad = {
  id: 'a1',
  proyectoId: 'p1',
  nombre: 'Excavación',
  bac: 100_000,
  porcentajeAvancePlanificado: 50,
  porcentajeAvanceReal: 40,
  costoReal: 50_000,
};

function renderPantalla() {
  return render(
    <MemoryRouter initialEntries={['/proyectos/p1/actividades']}>
      <Routes>
        <Route path="/proyectos/:proyectoId/actividades" element={<ActividadesListado />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ActividadesListado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    proyectosApiMock.obtener.mockResolvedValue(proyecto);
  });

  it('shows a loading state while fetching and then renders the project name and activities', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue([actividadExistente]);

    renderPantalla();

    expect(screen.getByText('Cargando actividades...')).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.queryByText('Cargando actividades...'));
    expect(await screen.findByRole('heading', { name: 'Torre Norte' })).toBeInTheDocument();
    expect(screen.getByText('Excavación')).toBeInTheDocument();
  });

  it('shows an error message when loading activities fails', async () => {
    actividadesApiMock.listarPorProyecto.mockRejectedValue(
      new ApiError(500, {
        categoria: 'inesperado',
        mensaje: 'Ocurrió un error inesperado.',
        referencia: 'x',
      }),
    );

    renderPantalla();

    expect(await screen.findByText('Ocurrió un error inesperado.')).toBeInTheDocument();
  });

  it('shows an error message when the project itself fails to load', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue([]);
    proyectosApiMock.obtener.mockRejectedValue(
      new ApiError(404, {
        categoria: 'no_encontrado',
        mensaje: 'El proyecto no existe.',
        referencia: 'x',
      }),
    );

    renderPantalla();

    expect(await screen.findByText('El proyecto no existe.')).toBeInTheDocument();
  });

  it('creates an activity and refreshes the list', async () => {
    actividadesApiMock.listarPorProyecto
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([actividadExistente]);
    actividadesApiMock.crear.mockResolvedValue(actividadExistente);
    const usuario = userEvent.setup();

    renderPantalla();
    await screen.findByText('No hay actividades registradas todavía.');

    await usuario.click(screen.getByRole('button', { name: 'Nueva actividad' }));
    await usuario.type(screen.getByLabelText('Nombre de la actividad'), 'Excavación');
    await usuario.type(screen.getByLabelText('Presupuesto planificado (BAC)'), '100000');
    await usuario.type(screen.getByLabelText('% Avance planificado'), '50');
    await usuario.type(screen.getByLabelText('% Avance real'), '40');
    await usuario.type(screen.getByLabelText('Costo real incurrido (AC)'), '50000');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(actividadesApiMock.crear).toHaveBeenCalledWith('p1', {
        nombre: 'Excavación',
        bac: 100_000,
        porcentajeAvancePlanificado: 50,
        porcentajeAvanceReal: 40,
        costoReal: 50_000,
      }),
    );
    expect(await screen.findByText('Excavación')).toBeInTheDocument();
    expect(await screen.findByText('Actividad creada correctamente.')).toBeInTheDocument();
  });

  it('fetches the latest activity data before opening the edit form', async () => {
    const actividadActualizada: Actividad = { ...actividadExistente, nombre: 'Excavación (rev)' };
    actividadesApiMock.listarPorProyecto.mockResolvedValue([actividadExistente]);
    actividadesApiMock.obtener.mockResolvedValue(actividadActualizada);
    const usuario = userEvent.setup();

    renderPantalla();
    await screen.findByText('Excavación');

    await usuario.click(screen.getByRole('button', { name: 'Editar' }));

    expect(actividadesApiMock.obtener).toHaveBeenCalledWith('a1');
    expect(await screen.findByLabelText('Nombre de la actividad')).toHaveValue(
      'Excavación (rev)',
    );
  });

  it('edits an activity and refreshes the list', async () => {
    actividadesApiMock.listarPorProyecto
      .mockResolvedValueOnce([actividadExistente])
      .mockResolvedValueOnce([{ ...actividadExistente, nombre: 'Excavación actualizada' }]);
    actividadesApiMock.obtener.mockResolvedValue(actividadExistente);
    actividadesApiMock.editar.mockResolvedValue({
      ...actividadExistente,
      nombre: 'Excavación actualizada',
    });
    const usuario = userEvent.setup();

    renderPantalla();
    await screen.findByText('Excavación');

    await usuario.click(screen.getByRole('button', { name: 'Editar' }));
    const input = await screen.findByLabelText('Nombre de la actividad');
    await usuario.clear(input);
    await usuario.type(input, 'Excavación actualizada');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(actividadesApiMock.editar).toHaveBeenCalled());
    expect(await screen.findByText('Excavación actualizada')).toBeInTheDocument();
  });

  it('deletes an activity after confirming in the dialog and refreshes the list', async () => {
    actividadesApiMock.listarPorProyecto
      .mockResolvedValueOnce([actividadExistente])
      .mockResolvedValueOnce([]);
    actividadesApiMock.eliminar.mockResolvedValue(undefined);
    const usuario = userEvent.setup();

    renderPantalla();
    await screen.findByText('Excavación');

    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Eliminar actividad' }));

    await waitFor(() => expect(actividadesApiMock.eliminar).toHaveBeenCalledWith('a1'));
    expect(await screen.findByText('No hay actividades registradas todavía.')).toBeInTheDocument();
    expect(await screen.findByText('Actividad eliminada correctamente.')).toBeInTheDocument();
  });

  it('does not delete when the user cancels the confirmation dialog (edge case)', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue([actividadExistente]);
    const usuario = userEvent.setup();

    renderPantalla();
    await screen.findByText('Excavación');

    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(actividadesApiMock.eliminar).not.toHaveBeenCalled();
  });

  it('shows an error message when deleting fails', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue([actividadExistente]);
    actividadesApiMock.eliminar.mockRejectedValue(
      new ApiError(404, {
        categoria: 'no_encontrado',
        mensaje: 'La actividad no existe.',
        referencia: 'x',
      }),
    );
    const usuario = userEvent.setup();

    renderPantalla();
    await screen.findByText('Excavación');

    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
    await usuario.click(screen.getByRole('button', { name: 'Eliminar actividad' }));

    expect(await screen.findByText('La actividad no existe.')).toBeInTheDocument();
  });

  it('has a link back to the projects list', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue([]);

    renderPantalla();

    expect(await screen.findByRole('link', { name: /Volver a proyectos/ })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
