import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormularioActividad } from './FormularioActividad';
import { ApiError } from '../../api/apiError';
import type { ActividadInput } from '../../types/actividad';

const DATOS_VALIDOS: ActividadInput = {
  nombre: 'Excavación',
  bac: 100_000,
  porcentajeAvancePlanificado: 50,
  porcentajeAvanceReal: 40,
  costoReal: 50_000,
};

async function completarFormulario(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText('Nombre de la actividad'), DATOS_VALIDOS.nombre);
  await usuario.type(
    screen.getByLabelText('Presupuesto planificado (BAC)'),
    String(DATOS_VALIDOS.bac),
  );
  await usuario.type(
    screen.getByLabelText('% Avance planificado'),
    String(DATOS_VALIDOS.porcentajeAvancePlanificado),
  );
  await usuario.type(
    screen.getByLabelText('% Avance real'),
    String(DATOS_VALIDOS.porcentajeAvanceReal),
  );
  await usuario.type(
    screen.getByLabelText('Costo real incurrido (AC)'),
    String(DATOS_VALIDOS.costoReal),
  );
}

describe('FormularioActividad', () => {
  it('pre-fills every field with the initial values when editing', () => {
    render(<FormularioActividad valoresIniciales={DATOS_VALIDOS} onGuardar={vi.fn()} onCancelar={vi.fn()} />);

    expect(screen.getByLabelText('Nombre de la actividad')).toHaveValue('Excavación');
    expect(screen.getByLabelText('Presupuesto planificado (BAC)')).toHaveValue(100_000);
    expect(screen.getByLabelText('% Avance planificado')).toHaveValue(50);
    expect(screen.getByLabelText('% Avance real')).toHaveValue(40);
    expect(screen.getByLabelText('Costo real incurrido (AC)')).toHaveValue(50_000);
  });

  it('shows a validation error and does not call onGuardar when the name is empty', async () => {
    const onGuardar = vi.fn();
    const usuario = userEvent.setup();
    render(<FormularioActividad onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.getByText('El nombre de la actividad no puede estar vacío.')).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('shows a validation error when bac is negative', async () => {
    const onGuardar = vi.fn();
    const usuario = userEvent.setup();
    render(<FormularioActividad onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText('Nombre de la actividad'), 'Excavación');
    await usuario.type(screen.getByLabelText('Presupuesto planificado (BAC)'), '-1');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(
      screen.getByText('El presupuesto planificado (BAC) debe ser un número mayor o igual a cero.'),
    ).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('shows a validation error when a percentage is above 100', async () => {
    const onGuardar = vi.fn();
    const usuario = userEvent.setup();
    render(<FormularioActividad onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText('Nombre de la actividad'), 'Excavación');
    await usuario.type(screen.getByLabelText('% Avance planificado'), '150');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(
      screen.getByText('El porcentaje de avance planificado debe estar entre 0 y 100.'),
    ).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('accepts an actual cost of zero, since it is a valid EVM edge case', async () => {
    const onGuardar = vi.fn().mockResolvedValue(undefined);
    const usuario = userEvent.setup();
    render(<FormularioActividad onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText('Nombre de la actividad'), 'Excavación');
    await usuario.type(screen.getByLabelText('Presupuesto planificado (BAC)'), '100000');
    await usuario.type(screen.getByLabelText('% Avance planificado'), '50');
    await usuario.type(screen.getByLabelText('% Avance real'), '0');
    await usuario.type(screen.getByLabelText('Costo real incurrido (AC)'), '0');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(onGuardar).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Excavación', costoReal: 0 }),
      ),
    );
  });

  it('calls onGuardar with the parsed numeric payload on a successful submission', async () => {
    const onGuardar = vi.fn().mockResolvedValue(undefined);
    const usuario = userEvent.setup();
    render(<FormularioActividad onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await completarFormulario(usuario);
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onGuardar).toHaveBeenCalledWith(DATOS_VALIDOS));
  });

  it('disables the inputs while the submission is in progress', async () => {
    let resolverGuardado: () => void = () => undefined;
    const onGuardar = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolverGuardado = resolve;
        }),
    );
    const usuario = userEvent.setup();
    render(<FormularioActividad onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await completarFormulario(usuario);
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
    expect(screen.getByLabelText('Nombre de la actividad')).toBeDisabled();

    resolverGuardado();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Guardar' })).not.toBeDisabled(),
    );
  });

  it('shows the API error message when onGuardar rejects', async () => {
    const onGuardar = vi
      .fn()
      .mockRejectedValue(
        new ApiError(404, {
          categoria: 'no_encontrado',
          mensaje: 'El proyecto no existe.',
          referencia: 'abc',
        }),
      );
    const usuario = userEvent.setup();
    render(<FormularioActividad onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await completarFormulario(usuario);
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('El proyecto no existe.')).toBeInTheDocument();
  });

  it('calls onCancelar when the Cancelar button is clicked', async () => {
    const onCancelar = vi.fn();
    const usuario = userEvent.setup();
    render(<FormularioActividad onGuardar={vi.fn()} onCancelar={onCancelar} />);

    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancelar).toHaveBeenCalled();
  });
});
