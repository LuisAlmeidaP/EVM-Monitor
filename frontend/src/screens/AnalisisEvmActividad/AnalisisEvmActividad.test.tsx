import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalisisEvmActividad } from './AnalisisEvmActividad';
import { actividadesApi } from '../../api/actividadesApi';
import { ApiError } from '../../api/apiError';
import type { AnalisisEvmActividad as AnalisisEvmActividadData } from '../../types/analisisEvm';

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

const actividadesApiMock = vi.mocked(actividadesApi);

const ANALISIS: AnalisisEvmActividadData = {
  actividadId: 'a1',
  proyectoId: 'p1',
  nombre: 'Excavación',
  datosAvance: { bac: 100_000, porcentajeAvancePlanificado: 50, porcentajeAvanceReal: 40, costoReal: 50_000 },
  indicadores: { pv: 50_000, ev: 40_000, cv: -10_000, sv: -10_000, cpi: 0.8, spi: 0.8, eac: 125_000, vac: -25_000 },
  interpretacion: { estadoCosto: 'sobre_presupuesto', estadoCronograma: 'atrasado' },
  estadoGeneral: 'critico',
};

function renderPantalla() {
  return render(
    <MemoryRouter initialEntries={['/actividades/a1/analisis-evm']}>
      <Routes>
        <Route path="/actividades/:actividadId/analisis-evm" element={<AnalisisEvmActividad />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AnalisisEvmActividad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state while fetching the analysis', async () => {
    actividadesApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(screen.getByText('Cargando análisis EVM...')).toBeInTheDocument();
    await waitForElementToBeRemoved(() => screen.queryByText('Cargando análisis EVM...'));
  });

  it('renders every required indicator (PV, EV, AC, BAC, CV, SV, CPI, SPI) from the API response', async () => {
    actividadesApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(await screen.findByRole('heading', { name: 'Excavación' })).toBeInTheDocument();
    expect(screen.getAllByText('BAC').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PV').length).toBeGreaterThan(0);
    expect(screen.getAllByText('EV').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AC').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CV').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SV').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CPI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('SPI').length).toBeGreaterThan(0);
    expect(screen.getAllByText('100.000').length).toBeGreaterThan(0);
    expect(screen.getAllByText('-10.000').length).toBeGreaterThan(0);
  });

  it('renders the overall status matching the backend response', async () => {
    actividadesApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(await screen.findByText('Crítico')).toBeInTheDocument();
  });

  it('renders the cost/schedule interpretation matching the backend response', async () => {
    actividadesApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(await screen.findByText(/gastando más de lo planeado/)).toBeInTheDocument();
    expect(screen.getByText(/por debajo del avance planificado/)).toBeInTheDocument();
  });

  it('renders the deviation alerts derived from the interpretation', async () => {
    actividadesApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    renderPantalla();

    expect(await screen.findByText(/Sobrecosto/)).toBeInTheDocument();
    expect(screen.getByText(/Retraso/)).toBeInTheDocument();
  });

  it('renders both charts once the analysis loads', async () => {
    actividadesApiMock.obtenerAnalisisEvm.mockResolvedValue(ANALISIS);

    const { container } = renderPantalla();
    await screen.findByRole('heading', { name: 'Excavación' });

    expect(screen.getByText('Valor planificado, ganado y real')).toBeInTheDocument();
    expect(screen.getByText('Índices de desempeño')).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-wrapper').length).toBeGreaterThan(0),
    );
  });

  it('shows an error message when the activity does not exist', async () => {
    actividadesApiMock.obtenerAnalisisEvm.mockRejectedValue(
      new ApiError(404, {
        categoria: 'no_encontrado',
        mensaje: 'No se encontró una actividad con el identificador dado.',
        referencia: 'x',
      }),
    );

    renderPantalla();

    expect(
      await screen.findByText('No se encontró una actividad con el identificador dado.'),
    ).toBeInTheDocument();
  });

  it('shows "N/D" and a null overall status when indices are indeterminate (edge case)', async () => {
    actividadesApiMock.obtenerAnalisisEvm.mockResolvedValue({
      ...ANALISIS,
      indicadores: { ...ANALISIS.indicadores, cpi: null, spi: null, eac: null, vac: null },
      interpretacion: { estadoCosto: null, estadoCronograma: null },
      estadoGeneral: null,
    });

    renderPantalla();

    expect(await screen.findByText('Sin datos suficientes')).toBeInTheDocument();
    expect(screen.getAllByText('N/D').length).toBeGreaterThan(0);
  });
});
