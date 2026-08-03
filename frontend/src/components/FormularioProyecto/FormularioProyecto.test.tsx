import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormularioProyecto } from './FormularioProyecto';
import { ApiError } from '../../api/apiError';

describe('FormularioProyecto', () => {
  it('pre-fills the input with the initial value when editing', () => {
    render(
      <FormularioProyecto valorInicial="Torre Norte" onGuardar={vi.fn()} onCancelar={vi.fn()} />,
    );

    expect(screen.getByLabelText('Nombre del proyecto')).toHaveValue('Torre Norte');
  });

  it('shows a validation error and does not call onGuardar when the name is empty', async () => {
    const onGuardar = vi.fn();
    const usuario = userEvent.setup();
    render(<FormularioProyecto onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.getByText('El nombre del proyecto no puede estar vacío.')).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('shows a validation error when the name is only whitespace', async () => {
    const onGuardar = vi.fn();
    const usuario = userEvent.setup();
    render(<FormularioProyecto onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText('Nombre del proyecto'), '   ');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.getByText('El nombre del proyecto no puede estar vacío.')).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('calls onGuardar with the trimmed name on a successful submission', async () => {
    const onGuardar = vi.fn().mockResolvedValue(undefined);
    const usuario = userEvent.setup();
    render(<FormularioProyecto onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText('Nombre del proyecto'), '  Torre Norte  ');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onGuardar).toHaveBeenCalledWith('Torre Norte'));
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
    render(<FormularioProyecto onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText('Nombre del proyecto'), 'Torre Norte');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
    expect(screen.getByLabelText('Nombre del proyecto')).toBeDisabled();

    resolverGuardado();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Guardar' })).not.toBeDisabled(),
    );
  });

  it('shows the API error message when onGuardar rejects', async () => {
    const onGuardar = vi
      .fn()
      .mockRejectedValue(
        new ApiError(422, { categoria: 'negocio', mensaje: 'El nombre ya está en uso.', referencia: 'abc' }),
      );
    const usuario = userEvent.setup();
    render(<FormularioProyecto onGuardar={onGuardar} onCancelar={vi.fn()} />);

    await usuario.type(screen.getByLabelText('Nombre del proyecto'), 'Torre Norte');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('El nombre ya está en uso.')).toBeInTheDocument();
  });

  it('calls onCancelar when the Cancelar button is clicked', async () => {
    const onCancelar = vi.fn();
    const usuario = userEvent.setup();
    render(<FormularioProyecto onGuardar={vi.fn()} onCancelar={onCancelar} />);

    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancelar).toHaveBeenCalled();
  });
});
