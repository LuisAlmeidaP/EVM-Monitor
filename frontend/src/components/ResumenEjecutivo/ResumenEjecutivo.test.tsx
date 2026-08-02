import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResumenEjecutivo } from './ResumenEjecutivo';

describe('ResumenEjecutivo', () => {
  it('summarizes a critical project in plain language, matching the backend interpretation', () => {
    render(
      <ResumenEjecutivo
        estadoGeneral="critico"
        interpretacion={{ estadoCosto: 'sobre_presupuesto', estadoCronograma: 'atrasado' }}
        cantidadActividades={3}
      />,
    );

    expect(screen.getByText('Crítico')).toBeInTheDocument();
    expect(screen.getByText(/consolida 3 actividades/)).toBeInTheDocument();
    expect(screen.getByText(/en estado crítico/)).toBeInTheDocument();
    expect(screen.getByText(/el costo real supera lo planeado/)).toBeInTheDocument();
    expect(screen.getByText(/atrasado respecto al cronograma/)).toBeInTheDocument();
  });

  it('summarizes a healthy project in plain language', () => {
    render(
      <ResumenEjecutivo
        estadoGeneral="saludable"
        interpretacion={{ estadoCosto: 'bajo_presupuesto', estadoCronograma: 'adelantado' }}
        cantidadActividades={1}
      />,
    );

    expect(screen.getByText('Saludable')).toBeInTheDocument();
    expect(screen.getByText(/consolida 1 actividad(?!es)/)).toBeInTheDocument();
    expect(screen.getByText(/está por debajo de lo planeado/)).toBeInTheDocument();
    expect(screen.getByText(/adelantado respecto al cronograma/)).toBeInTheDocument();
  });

  it('shows a neutral summary when the overall status is indeterminate (edge case)', () => {
    render(
      <ResumenEjecutivo
        estadoGeneral={null}
        interpretacion={{ estadoCosto: null, estadoCronograma: null }}
        cantidadActividades={2}
      />,
    );

    expect(screen.getByText('Sin datos suficientes')).toBeInTheDocument();
    expect(screen.getByText(/Aún no hay datos suficientes/)).toBeInTheDocument();
  });
});
