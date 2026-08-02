import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardProyecto } from './DashboardProyecto';
import { actividadesApi } from '../../api/actividadesApi';
import { proyectosApi } from '../../api/proyectosApi';
import { ApiError } from '../../api/apiError';
import type { Actividad } from '../../types/actividad';
import type { AnalisisConsolidadoProyecto } from '../../types/analisisEvm';
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

const actividades: Actividad[] = [
  {
    id: 'a1',
    proyectoId: 'p1',
    nombre: 'Excavación',
    bac: 100_000,
    porcentajeAvancePlanificado: 50,
    porcentajeAvanceReal: 40,
    costoReal: 50_000,
  },
  {
    id: 'a2',
    proyectoId: 'p1',
    nombre: 'Cimentación',
    bac: 200_000,
    porcentajeAvancePlanificado: 30,
    porcentajeAvanceReal: 35,
    costoReal: 65_000,
  },
];

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
  });

  it('shows a loading state while fetching', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue(actividades);
    proyectosApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(screen.getByText('Cargando dashboard del proyecto...')).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText('Cargando dashboard del proyecto...'));
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

  it('renders the charts and the read-only activities table once loaded', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue(actividades);
    proyectosApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    const { container } = renderPantalla();
    await screen.findByRole('heading', { name: 'Torre Norte' });

    expect(screen.getByText('Valor planificado, ganado y real')).toBeInTheDocument();
    expect(screen.getByText('Índices de desempeño')).toBeInTheDocument();
    expect(screen.getByText('Distribución del presupuesto')).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-wrapper').length).toBeGreaterThan(0),
    );
    expect(screen.getByText('Cimentación')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  });

  it('shows an empty state with a call to action when the project has no activities yet (edge case)', async () => {
    actividadesApiMock.listarPorProyecto.mockResolvedValue([]);

    renderPantalla();

    expect(
      await screen.findByText('Este proyecto no tiene actividades registradas todavía.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crear la primera actividad' })).toHaveAttribute(
      'href',
      '/proyectos/p1/actividades',
    );
    expect(proyectosApiMock.obtenerAnalisisEvm).not.toHaveBeenCalled();
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
    expect(screen.getAllByRole('link', { name: /Gestionar actividades/ })[0]).toHaveAttribute(
      'href',
      '/proyectos/p1/actividades',
    );
  });
});
