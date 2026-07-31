import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MensajeError } from '../MensajeError/MensajeError';
import { obtenerMensajeDeError } from '../../api/apiError';
import type { ActividadInput } from '../../types/actividad';

interface CamposFormulario {
  nombre: string;
  bac: string;
  porcentajeAvancePlanificado: string;
  porcentajeAvanceReal: string;
  costoReal: string;
}

interface FormularioActividadProps {
  readonly valoresIniciales?: ActividadInput;
  readonly onGuardar: (datos: ActividadInput) => Promise<void>;
  readonly onCancelar: () => void;
}

const CAMPOS_VACIOS: CamposFormulario = {
  nombre: '',
  bac: '',
  porcentajeAvancePlanificado: '',
  porcentajeAvanceReal: '',
  costoReal: '',
};

function aCampos(datos: ActividadInput): CamposFormulario {
  return {
    nombre: datos.nombre,
    bac: String(datos.bac),
    porcentajeAvancePlanificado: String(datos.porcentajeAvancePlanificado),
    porcentajeAvanceReal: String(datos.porcentajeAvanceReal),
    costoReal: String(datos.costoReal),
  };
}

function validarCampos(campos: CamposFormulario): Partial<Record<keyof CamposFormulario, string>> {
  const errores: Partial<Record<keyof CamposFormulario, string>> = {};

  if (campos.nombre.trim().length === 0) {
    errores.nombre = 'El nombre de la actividad no puede estar vacío.';
  }

  const bac = Number(campos.bac);
  if (campos.bac.trim().length === 0 || !Number.isFinite(bac) || bac < 0) {
    errores.bac = 'El presupuesto planificado (BAC) debe ser un número mayor o igual a cero.';
  }

  const porcentajeAvancePlanificado = Number(campos.porcentajeAvancePlanificado);
  if (
    campos.porcentajeAvancePlanificado.trim().length === 0 ||
    !Number.isFinite(porcentajeAvancePlanificado) ||
    porcentajeAvancePlanificado < 0 ||
    porcentajeAvancePlanificado > 100
  ) {
    errores.porcentajeAvancePlanificado = 'El porcentaje de avance planificado debe estar entre 0 y 100.';
  }

  const porcentajeAvanceReal = Number(campos.porcentajeAvanceReal);
  if (
    campos.porcentajeAvanceReal.trim().length === 0 ||
    !Number.isFinite(porcentajeAvanceReal) ||
    porcentajeAvanceReal < 0 ||
    porcentajeAvanceReal > 100
  ) {
    errores.porcentajeAvanceReal = 'El porcentaje de avance real debe estar entre 0 y 100.';
  }

  const costoReal = Number(campos.costoReal);
  if (campos.costoReal.trim().length === 0 || !Number.isFinite(costoReal) || costoReal < 0) {
    errores.costoReal = 'El costo real incurrido (AC) debe ser un número mayor o igual a cero.';
  }

  return errores;
}

export function FormularioActividad({
  valoresIniciales,
  onGuardar,
  onCancelar,
}: FormularioActividadProps) {
  const [campos, setCampos] = useState<CamposFormulario>(
    valoresIniciales ? aCampos(valoresIniciales) : CAMPOS_VACIOS,
  );
  const [errores, setErrores] = useState<Partial<Record<keyof CamposFormulario, string>>>({});
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const manejarCambio = (campo: keyof CamposFormulario, valor: string): void => {
    setCampos((anteriores) => ({ ...anteriores, [campo]: valor }));
    if (errores[campo]) {
      setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
    }
  };

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>): Promise<void> => {
    evento.preventDefault();

    const erroresEncontrados = validarCampos(campos);
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados);
      return;
    }

    setErrores({});
    setErrorEnvio(null);
    setEnviando(true);

    try {
      await onGuardar({
        nombre: campos.nombre.trim(),
        bac: Number(campos.bac),
        porcentajeAvancePlanificado: Number(campos.porcentajeAvancePlanificado),
        porcentajeAvanceReal: Number(campos.porcentajeAvanceReal),
        costoReal: Number(campos.costoReal),
      });
    } catch (error) {
      setErrorEnvio(obtenerMensajeDeError(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={(evento) => void manejarEnvio(evento)} className="flex flex-col gap-4">
      <Input
        id="nombre-actividad"
        label="Nombre de la actividad"
        placeholder="Ej. Excavación"
        value={campos.nombre}
        onChange={(evento) => manejarCambio('nombre', evento.target.value)}
        disabled={enviando}
        error={errores.nombre}
        autoFocus
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id="bac-actividad"
          label="Presupuesto planificado (BAC)"
          type="number"
          value={campos.bac}
          onChange={(evento) => manejarCambio('bac', evento.target.value)}
          disabled={enviando}
          error={errores.bac}
        />
        <Input
          id="costo-real-actividad"
          label="Costo real incurrido (AC)"
          type="number"
          value={campos.costoReal}
          onChange={(evento) => manejarCambio('costoReal', evento.target.value)}
          disabled={enviando}
          error={errores.costoReal}
        />
        <Input
          id="porcentaje-planificado-actividad"
          label="% Avance planificado"
          type="number"
          value={campos.porcentajeAvancePlanificado}
          onChange={(evento) => manejarCambio('porcentajeAvancePlanificado', evento.target.value)}
          disabled={enviando}
          error={errores.porcentajeAvancePlanificado}
        />
        <Input
          id="porcentaje-real-actividad"
          label="% Avance real"
          type="number"
          value={campos.porcentajeAvanceReal}
          onChange={(evento) => manejarCambio('porcentajeAvanceReal', evento.target.value)}
          disabled={enviando}
          error={errores.porcentajeAvanceReal}
        />
      </div>
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
