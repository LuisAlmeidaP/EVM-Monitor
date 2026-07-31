import { useState } from 'react';
import type { FormEvent } from 'react';
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
    <form onSubmit={(evento) => void manejarEnvio(evento)}>
      <label htmlFor="nombre-proyecto">Nombre del proyecto</label>
      <input
        id="nombre-proyecto"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        disabled={enviando}
      />
      {errorValidacion && <MensajeError mensaje={errorValidacion} />}
      {errorEnvio && <MensajeError mensaje={errorEnvio} />}
      <button type="submit" disabled={enviando}>
        {enviando ? 'Guardando...' : 'Guardar'}
      </button>
      <button type="button" onClick={onCancelar} disabled={enviando}>
        Cancelar
      </button>
    </form>
  );
}
