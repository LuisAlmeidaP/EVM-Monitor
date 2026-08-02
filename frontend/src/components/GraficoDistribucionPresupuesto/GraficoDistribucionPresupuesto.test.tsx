import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GraficoDistribucionPresupuesto } from './GraficoDistribucionPresupuesto';

describe('GraficoDistribucionPresupuesto', () => {
  it('renders the used-budget percentage and a segment per category', async () => {
    const { container } = render(
      <GraficoDistribucionPresupuesto bacTotal={100_000} acTotal={60_000} />,
    );

    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText(/Gastado: 60.000/)).toBeInTheDocument();
    expect(screen.getByText(/Disponible: 40.000/)).toBeInTheDocument();
    await waitFor(() => expect(container.querySelectorAll('.recharts-pie-sector')).toHaveLength(2));
  });

  it('shows an overspend segment when actual cost exceeds the total budget (edge case)', () => {
    render(<GraficoDistribucionPresupuesto bacTotal={100_000} acTotal={120_000} />);

    expect(screen.getByText('120%')).toBeInTheDocument();
    expect(screen.getByText(/Gastado: 100.000/)).toBeInTheDocument();
    expect(screen.queryByText(/Disponible/)).not.toBeInTheDocument();
    expect(screen.getByText(/Sobregasto: 20.000/)).toBeInTheDocument();
  });

  it('renders a fallback message when there is no budget registered yet (edge case)', () => {
    const { container } = render(<GraficoDistribucionPresupuesto bacTotal={0} acTotal={0} />);

    expect(
      screen.getByText('Aún no hay presupuesto registrado para visualizar la distribución.'),
    ).toBeInTheDocument();
    expect(container.querySelector('.recharts-wrapper')).toBeNull();
  });
});
