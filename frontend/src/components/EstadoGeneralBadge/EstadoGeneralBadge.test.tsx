import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EstadoGeneralBadge } from './EstadoGeneralBadge';

describe('EstadoGeneralBadge', () => {
  it('renders "Saludable" with a positive description', () => {
    render(<EstadoGeneralBadge estado="saludable" />);

    expect(screen.getByText('Saludable')).toBeInTheDocument();
    expect(screen.getByText(/va según lo planeado/)).toBeInTheDocument();
  });

  it('renders "En riesgo" with a warning description', () => {
    render(<EstadoGeneralBadge estado="en_riesgo" />);

    expect(screen.getByText('En riesgo')).toBeInTheDocument();
    expect(screen.getByText(/conviene revisar pronto/)).toBeInTheDocument();
  });

  it('renders "Crítico" with an urgent description', () => {
    render(<EstadoGeneralBadge estado="critico" />);

    expect(screen.getByText('Crítico')).toBeInTheDocument();
    expect(screen.getByText(/atención inmediata/)).toBeInTheDocument();
  });

  it('renders a neutral message when the status is indeterminate (edge case)', () => {
    render(<EstadoGeneralBadge estado={null} />);

    expect(screen.getByText('Sin datos suficientes')).toBeInTheDocument();
  });
});
