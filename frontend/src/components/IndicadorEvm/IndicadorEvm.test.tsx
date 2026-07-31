import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IndicadorEvm } from './IndicadorEvm';

describe('IndicadorEvm', () => {
  it('renders the label, value and description', () => {
    render(<IndicadorEvm etiqueta="CPI" valor="0,80" descripcion="Eficiencia del costo" />);

    expect(screen.getByText('CPI')).toBeInTheDocument();
    expect(screen.getByText('0,80')).toBeInTheDocument();
    expect(screen.getByText('Eficiencia del costo')).toBeInTheDocument();
  });

  it('applies a neutral tone by default', () => {
    render(<IndicadorEvm etiqueta="BAC" valor="100.000" descripcion="Presupuesto total" />);

    expect(screen.getByText('100.000')).toHaveClass('text-apagado');
  });

  it('applies the critical tone class when tono is "critico"', () => {
    render(<IndicadorEvm etiqueta="CV" valor="-10.000" descripcion="Variación de costo" tono="critico" />);

    expect(screen.getByText('-10.000')).toHaveClass('text-peligro');
  });

  it('applies the correct tone class when tono is "correcto" (edge case: positive variation)', () => {
    render(<IndicadorEvm etiqueta="CV" valor="10.000" descripcion="Variación de costo" tono="correcto" />);

    expect(screen.getByText('10.000')).toHaveClass('text-exito');
  });
});
