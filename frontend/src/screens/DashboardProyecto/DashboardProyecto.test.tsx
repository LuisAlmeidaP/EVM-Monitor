import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardProyecto } from './DashboardProyecto';
import { actividadesApi } from '../../api/actividadesApi';
import { proyectosApi } from '../../api/proyectosApi';
import { ApiError } from '../../api/apiError';
import type { Actividad } from '../../types/actividad';
import type { AnalisisConsolidadoProyecto, AnalisisEvmActividad } from '../../types/analisisEvm';
import type { Proyecto } from '../../types/proyecto';

vi.mock('../../api/actividadesApi', () => ({
  actividadesApi: {
    listarPorProyecto: vi.fn(),
    obtener: vi.fn(),
    obtenerAnalisisEvm: vi.fn(),
    crear: vi.fn(),
    editar: vi.fn(),
    eliminar: vi.fn(),
  },
}));

vi.mock('../../api/proyectosApi', () => ({
  proyectosApi: {
    listar: vi.fn(),
    obtener: vi.fn(),
    obtenerAnalisisEvm: vi.fn(),
    crear: vi.fn(),
    editar: vi.fn(),
    eliminar: vi.fn(),
  },
}));

const actividadesApiMock = vi.mocked(actividadesApi);
const proyectosApiMock = vi.mocked(proyectosApi);

const proyecto: Proyecto = { id: 'p1', nombre: 'Torre Norte' };

const excavacion: Actividad = {
  id: 'a1',
  proyectoId: 'p1',
  nombre: 'Excavación',
  bac: 100_000,
  porcentajeAvancePlanificado: 50,
  porcentajeAvanceReal: 40,
  costoReal: 50_000,
};

const cimentacion: Actividad = {
  id: 'a2',
  proyectoId: 'p1',
  nombre: 'Cimentación',
  bac: 200_000,
  porcentajeAvancePlanificado: 30,
  porcentajeAvanceReal: 35,
  costoReal: 65_000,
};

const actividades: Actividad[] = [excavacion, cimentacion];

const ANALISIS: AnalisisConsolidadoProyecto = {
  proyectoId: 'p1',
  cantidadActividades: 2,
  indicadores: {
    pv: 110_000,
    ev: 110_000,
    cv: -5_000,
    sv: 0,
    cpi: 110_000 / 115_000,
    spi: 1,
    eac: 313_636.36,
    vac: -13_636.36,
  },
  interpretacion: { estadoCosto: 'sobre_presupuesto', estadoCronograma: 'a_tiempo' },
  estadoGeneral: 'en_riesgo',
};

const ANALISIS_UNA_ACTIVIDAD: AnalisisConsolidadoProyecto = {
  proyectoId: 'p1',
  cantidadActividades: 1,
  indicadores: {
    pv: 50_000,
    ev: 40_000,
    cv: -10_000,
    sv: -10_000,
    cpi: 0.8,
    spi: 0.8,
    eac: 125_000,
    vac: -25_000,
  },
  interpretacion: { estadoCosto: 'sobre_presupuesto', estadoCronograma: 'atrasado' },
  estadoGeneral: 'critico',
};

function analisisIndividualPorDefecto(actividad: Actividad): AnalisisEvmActividad {
  return {
    actividadId: actividad.id,
    proyectoId: actividad.proyectoId,
    nombre: actividad.nombre,
    datosAvance: {
      bac: actividad.bac,
      porcentajeAvancePlanificado: actividad.porcentajeAvancePlanificado,
      porcentajeAvanceReal: actividad.porcentajeAvanceReal,
      costoReal: actividad.costoReal,
    },
    indicadores: {
      pv: (actividad.porcentajeAvancePlanificado / 100) * actividad.bac,
      ev: (actividad.porcentajeAvanceReal / 100) * actividad.bac,
      cv: 0,
      sv: 0,
      cpi: 1,
      spi: 1,
      eac: actividad.bac,
      vac: 0,
    },
    interpretacion: { estadoCosto: 'en_presupuesto', estadoCronograma: 'a_tiempo' },
    estadoGeneral: 'saludable',
  };
}

function renderPantalla() {
  return render(
    <MemoryRouter initialEntries={['/proyectos/p1/dashboard']}>
      <Routes>
        <Route path="/proyectos/:proyectoId/dashboard" element={<DashboardProyecto />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('DashboardProyecto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    proyectosApiMock.obtener.mockResolvedValue(proyecto);
    // Análisis individual por actividad (usado para la gráfica comparativa
    // PV/EV/AC): por defecto responde con datos coherentes para cualquier id.
    actividadesApiMock.obtenerAnalisisEvm.mockImplementation((id: string) => {
      const actividad = actividades.find((candidata) => candidata.id === id) ?? excavacion;
      return Promise.resolve(analisisIndividualPorDefecto(actividad));
    });
  });

  it('shows a skeleton loading state while fetching the initial data', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue(actividades);
    proyectosApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(screen.getByRole('status', { name: 'Cargando dashboard del proyecto' })).toBeInTheDocument();
    await waitForElementToBeRemoved(() =>
      screen.queryByRole('status', { name: 'Cargando dashboard del proyecto' }),
    );
  });

  it('consumes the consolidated analysis endpoint and renders the project name', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue(actividades);
    proyectosApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(await screen.findByRole('heading', { name: 'Torre Norte' })).toBeInTheDocument();
    expect(proyectosApiMock.obtenerAnalisisEvm).toHaveBeenCalledWith('p1');
  });

  it('renders every required consolidated indicator (PV, EV, AC, BAC, CV, SV, CPI, SPI)', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue(actividades);
    proyectosApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(await screen.findByRole('heading', { name: 'Torre Norte' })).toBeInTheDocument();
    expect(screen.getAllByText('BAC').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PV').length).toBeGreaterThan(0);
    expect(screen.getAllByText('EV').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AC').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CV').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SV').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CPI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SPI').length).toBeGreaterThan(0);
    // BAC/AC totals are summed from the raw activities (100000+200000, 50000+65000)
    expect(screen.getAllByText('300.000').length).toBeGreaterThan(0);
    expect(screen.getAllByText('115.000').length).toBeGreaterThan(0);
  });

  it('renders the overall status and interpretation matching the backend response', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue(actividades);
    proyectosApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(await screen.findByText('En riesgo')).toBeInTheDocument();
    expect(screen.getByText(/gastando más de lo planeado/)).toBeInTheDocument();
    expect(screen.getByText(/coincide con el avance planificado/)).toBeInTheDocument();
  });

  it('renders the deviation alert derived from the interpretation', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue(actividades);
    proyectosApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(await screen.findByText(/Sobrecosto/)).toBeInTheDocument();
  });

  it('renders the charts and an interactive activities table once loaded', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue(actividades);
    proyectosApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    const { container } = renderPantalla();
    await screen.findByRole('heading', { name: 'Torre Norte' });

    expect(screen.getByText('Valor planificado, ganado y real')).toBeInTheDocument();
    expect(screen.getByText('Índices de desempeño')).toBeInTheDocument();
    expect(screen.getByText('Distribución del presupuesto')).toBeInTheDocument();
    expect(screen.getByText('PV, EV y AC por actividad')).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-wrapper').length).toBeGreaterThan(0),
    );
    // "Cimentación" now appears both in the comparison chart and the table below
    expect(screen.getAllByText('Cimentación').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Editar' }).length).toBeGreaterThan(0);
  });

  it('shows an empty state whose call to action opens the creation form inline, without navigating away (edge case)', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue([]);
    const usuario = userEvent.setup();

    renderPantalla();

    expect(
      await screen.findByText('Este proyecto no tiene actividades registradas todavía.'),
    ).toBeInTheDocument();
    expect(proyectosApiMock.obtenerAnalisisEvm).not.toHaveBeenCalled();

    await usuario.click(screen.getByRole('button', { name: 'Crear la primera actividad' }));

    expect(screen.getByRole('dialog', { name: 'Nueva actividad' })).toBeInTheDocument();
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

  it('links to the activities management screen', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue(actividades);
    proyectosApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(await screen.findByRole('heading', { name: 'Torre Norte' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gestionar actividades' })).toHaveAttribute(
      'href',
      '/proyectos/p1/actividades',
    );
  });

  describe('comparative PV/EV/AC per-activity chart', () => {
    it('renders the section with PV/EV/AC sourced from the individual activity analysis endpoint, not recalculated', async () => {
      actividadesApiMock.listarPorProyecto.mockResolvedValue(actividades);
      proyectosApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);
      actividadesApiMock.obtenerAnalisisEvm.mockImplementation((id: string) => {
        const actividad = actividades.find((candidata) => candidata.id === id) ?? excavacion;
        return Promise.resolve({
          ...analisisIndividualPorDefecto(actividad),
          indicadores: {
            ...analisisIndividualPorDefecto(actividad).indicadores,
            pv: actividad.id === 'a1' ? 50_000 : 60_000,
            ev: actividad.id === 'a1' ? 40_000 : 70_000,
          },
        });
      });

      const { container } = renderPantalla();
      await screen.findByRole('heading', { name: 'Torre Norte' });

      expect(screen.getByText('PV, EV y AC por actividad')).toBeInTheDocument();
      expect(actividadesApiMock.obtenerAnalisisEvm).toHaveBeenCalledWith('a1');
      expect(actividadesApiMock.obtenerAnalisisEvm).toHaveBeenCalledWith('a2');
      const seccion = screen.getByText('PV, EV y AC por actividad').closest('div') as HTMLElement;
      await waitFor(() =>
        expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBeGreaterThan(0),
      );
      expect(within(seccion).getByText('Excavación')).toBeInTheDocument();
      expect(within(seccion).getByText('Cimentación')).toBeInTheDocument();
    });

    it('updates automatically after an activity is edited, re-fetching each activity individual analysis again', async () => {
      const excavacionActualizada: Actividad = { ...excavacion, porcentajeAvanceReal: 100 };
      actividadesApiMock.listarPorProyecto
        .mockResolvedValueOnce([excavacion])
        .mockResolvedValueOnce([excavacionActualizada]);
      actividadesApiMock.obtener.mockResolvedValue(excavacion);
      proyectosApiMock.obtenerAnalisisEvm
        .mockResolvedValueOnce(ANALISIS_UNA_ACTIVIDAD)
        .mockResolvedValueOnce({ ...ANALISIS_UNA_ACTIVIDAD, estadoGeneral: 'saludable' });
      actividadesApiMock.editar.mockResolvedValue(excavacionActualizada);
      const usuario = userEvent.setup();

      renderPantalla();
      await screen.findByText('Crítico');
      expect(actividadesApiMock.obtenerAnalisisEvm).toHaveBeenCalledTimes(1);

      await usuario.click(screen.getByRole('button', { name: 'Editar' }));
      const campoReal = await screen.findByLabelText('% Avance real');
      await usuario.clear(campoReal);
      await usuario.type(campoReal, '100');
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

      await screen.findByText('Saludable');
      // Una llamada más por la actividad tras la mutación (recarga completa del comparativo)
      expect(actividadesApiMock.obtenerAnalisisEvm).toHaveBeenCalledTimes(2);
    });

    it('does not call the individual analysis endpoint when the project has no activities (edge case)', async () => {
      actividadesApiMock.listarPorProyecto.mockResolvedValue([]);

      renderPantalla();

      await screen.findByText('Este proyecto no tiene actividades registradas todavía.');
      expect(actividadesApiMock.obtenerAnalisisEvm).not.toHaveBeenCalled();
    });
  });

  describe('automatic refresh after a mutation', () => {
    it('creates an activity inline and refreshes the table, KPI cards and overall status without navigating away', async () => {
      actividadesApiMock.listarPorProyecto
        .mockResolvedValueOnce([excavacion])
        .mockResolvedValueOnce(actividades);
      proyectosApiMock.obtenerAnalisisEvm
        .mockResolvedValueOnce(ANALISIS_UNA_ACTIVIDAD)
        .mockResolvedValueOnce(ANALISIS);
      actividadesApiMock.crear.mockResolvedValue(cimentacion);
      const usuario = userEvent.setup();

      renderPantalla();
      await screen.findByText('Crítico');

      await usuario.click(screen.getByRole('button', { name: 'Nueva actividad' }));
      await usuario.type(screen.getByLabelText('Nombre de la actividad'), 'Cimentación');
      await usuario.type(screen.getByLabelText('Presupuesto planificado (BAC)'), '200000');
      await usuario.type(screen.getByLabelText('% Avance planificado'), '30');
      await usuario.type(screen.getByLabelText('% Avance real'), '35');
      await usuario.type(screen.getByLabelText('Costo real incurrido (AC)'), '65000');
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

      expect(await screen.findByText('Actividad creada correctamente.')).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      // Consolidated status flips from the single-activity "Crítico" to the two-activity "En riesgo"
      expect(await screen.findByText('En riesgo')).toBeInTheDocument();
      expect(screen.getAllByText('Cimentación').length).toBeGreaterThan(0);
      expect(actividadesApiMock.listarPorProyecto).toHaveBeenCalledTimes(2);
      expect(proyectosApiMock.obtenerAnalisisEvm).toHaveBeenCalledTimes(2);
      // The project itself is only fetched once — mutations never re-fetch it
      expect(proyectosApiMock.obtener).toHaveBeenCalledTimes(1);
    });

    it('shows a discreet "actualizando" indicator during the post-mutation refresh, without hiding existing content', async () => {
      actividadesApiMock.listarPorProyecto
        .mockResolvedValueOnce([excavacion])
        .mockResolvedValueOnce(actividades);
      let resolverAnalisisFinal: (valor: AnalisisConsolidadoProyecto) => void = () => undefined;
      proyectosApiMock.obtenerAnalisisEvm
        .mockResolvedValueOnce(ANALISIS_UNA_ACTIVIDAD)
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolverAnalisisFinal = resolve;
            }),
        );
      actividadesApiMock.crear.mockResolvedValue(cimentacion);
      const usuario = userEvent.setup();

      renderPantalla();
      await screen.findByText('Crítico');

      await usuario.click(screen.getByRole('button', { name: 'Nueva actividad' }));
      await usuario.type(screen.getByLabelText('Nombre de la actividad'), 'Cimentación');
      await usuario.type(screen.getByLabelText('Presupuesto planificado (BAC)'), '200000');
      await usuario.type(screen.getByLabelText('% Avance planificado'), '30');
      await usuario.type(screen.getByLabelText('% Avance real'), '35');
      await usuario.type(screen.getByLabelText('Costo real incurrido (AC)'), '65000');
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

      expect(await screen.findByText('Actualizando…')).toBeInTheDocument();
      // The previously loaded content stays mounted while refreshing
      expect(screen.getByText('Crítico')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Torre Norte' })).toBeInTheDocument();

      resolverAnalisisFinal(ANALISIS);
      await waitForElementToBeRemoved(() => screen.queryByText('Actualizando…'));
      expect(screen.getByText('En riesgo')).toBeInTheDocument();
    });

    it('edits an activity inline and refreshes the consolidated indicators', async () => {
      const excavacionActualizada: Actividad = { ...excavacion, porcentajeAvanceReal: 100 };
      actividadesApiMock.listarPorProyecto
        .mockResolvedValueOnce([excavacion])
        .mockResolvedValueOnce([excavacionActualizada]);
      actividadesApiMock.obtener.mockResolvedValue(excavacion);
      proyectosApiMock.obtenerAnalisisEvm
        .mockResolvedValueOnce(ANALISIS_UNA_ACTIVIDAD)
        .mockResolvedValueOnce({ ...ANALISIS_UNA_ACTIVIDAD, estadoGeneral: 'saludable' });
      actividadesApiMock.editar.mockResolvedValue(excavacionActualizada);
      const usuario = userEvent.setup();

      renderPantalla();
      await screen.findByText('Crítico');

      await usuario.click(screen.getByRole('button', { name: 'Editar' }));
      const campoReal = await screen.findByLabelText('% Avance real');
      await usuario.clear(campoReal);
      await usuario.type(campoReal, '100');
      await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

      expect(await screen.findByText('Actividad actualizada correctamente.')).toBeInTheDocument();
      expect(await screen.findByText('Saludable')).toBeInTheDocument();
    });

    it('deletes an activity inline after confirming, and shows the empty state again once none remain', async () => {
      actividadesApiMock.listarPorProyecto
        .mockResolvedValueOnce([excavacion])
        .mockResolvedValueOnce([]);
      proyectosApiMock.obtenerAnalisisEvm.mockResolvedValueOnce(ANALISIS_UNA_ACTIVIDAD);
      actividadesApiMock.eliminar.mockResolvedValue(undefined);
      const usuario = userEvent.setup();

      renderPantalla();
      await screen.findByText('Crítico');

      await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
      await usuario.click(screen.getByRole('button', { name: 'Eliminar actividad' }));

      expect(await screen.findByText('Actividad eliminada correctamente.')).toBeInTheDocument();
      expect(
        await screen.findByText('Este proyecto no tiene actividades registradas todavía.'),
      ).toBeInTheDocument();
      expect(proyectosApiMock.obtenerAnalisisEvm).toHaveBeenCalledTimes(1);
    });

    it('shows an inline error and keeps the dashboard usable when a mutation fails (edge case)', async () => {
      actividadesApiMock.listarPorProyecto.mockResolvedValue([excavacion]);
      proyectosApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS_UNA_ACTIVIDAD);
      actividadesApiMock.eliminar.mockRejectedValue(
        new ApiError(404, {
          categoria: 'no_encontrado',
          mensaje: 'La actividad no existe.',
          referencia: 'x',
        }),
      );
      const usuario = userEvent.setup();

      renderPantalla();
      await screen.findByText('Crítico');

      await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
      await usuario.click(screen.getByRole('button', { name: 'Eliminar actividad' }));

      expect(await screen.findByText('La actividad no existe.')).toBeInTheDocument();
      // The dashboard itself remains rendered, not replaced by a full error screen
      expect(screen.getByRole('heading', { name: 'Torre Norte' })).toBeInTheDocument();
    });
  });
});
