import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MensajeError } from '../MensajeError/MensajeError';
import { obtenerMensajeDeError } from '../../api/apiError';

const MENSAJE_NOMBRE_VACIO = 'El nombre del proyecto no puede estar vacío.';

interface FormularioProyectoProps {
  readonly valorInicial?: string;
  readonly onGuardar: (nombre: string) => Promise<void>;
  readonly onCancelar: () => void;
}

export function FormularioProyecto({
  valorInicial = '',
  onGuardar,
  onCancelar,
}: FormularioProyectoProps) {
  const [nombre, setNombre] = useState(valorInicial);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const manejarCambio = (valor: string): void => {
    setNombre(valor);
    if (errorValidacion) {
      setErrorValidacion(null);
    }
  };

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();

    const nombreNormalizado = nombre.trim();
    if (nombreNormalizado.length === 0) {
      setErrorValidacion(MENSAJE_NOMBRE_VACIO);
      return;
    }

    setErrorValidacion(null);
    setErrorEnvio(null);
    setEnviando(true);

    try {
      await onGuardar(nombreNormalizado);
    } catch (error) {
      setErrorEnvio(obtenerMensajeDeError(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={(evento) => void manejarEnvio(evento)} className="flex flex-col gap-4">
      <Input
        id="nombre-proyecto"
        label="Nombre del proyecto"
        placeholder="Ej. Ampliación planta norte"
        value={nombre}
        onChange={(evento) => manejarCambio(evento.target.value)}
        disabled={enviando}
        error={errorValidacion}
        autoFocus
      />
      {errorEnvio && <MensajeError mensaje={errorEnvio} />}
      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
