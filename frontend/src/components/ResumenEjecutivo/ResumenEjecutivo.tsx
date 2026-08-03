import { EstadoGeneralBadge } from '../EstadoGeneralBadge/EstadoGeneralBadge';
import type {
  EstadoCosto,
  EstadoCronograma,
  EstadoGeneral,
  InterpretacionEvm as InterpretacionEvmData,
} from '../../types/analisisEvm';

interface ResumenEjecutivoProps {
  readonly estadoGeneral: EstadoGeneral | null;
  readonly interpretacion: InterpretacionEvmData;
  readonly cantidadActividades: number;
}

const ETIQUETA_ESTADO: Record<EstadoGeneral, string> = {
  saludable: 'saludable',
  en_riesgo: 'en riesgo',
  critico: 'en estado crítico',
};

const CLAUSULA_COSTO: Record<EstadoCosto, string> = {
  bajo_presupuesto: 'el costo real está por debajo de lo planeado',
  en_presupuesto: 'el costo real coincide con lo planeado',
  sobre_presupuesto: 'el costo real supera lo planeado',
};

const CLAUSULA_CRONOGRAMA: Record<EstadoCronograma, string> = {
  adelantado: 'el avance va adelantado respecto al cronograma',
  a_tiempo: 'el avance va a tiempo respecto al cronograma',
  atrasado: 'el avance está atrasado respecto al cronograma',
};

function construirResumen({
  estadoGeneral,
  interpretacion,
  cantidadActividades,
}: ResumenEjecutivoProps): string {
  const sujeto = `Este proyecto consolida ${cantidadActividades} actividad${cantidadActividades === 1 ? '' : 'es'}`;

  if (estadoGeneral === null) {
    return `${sujeto}. Aún no hay datos suficientes (costo real o avance planificado en cero) para determinar su estado general.`;
  }

  const clausulaCosto = interpretacion.estadoCosto
    ? CLAUSULA_COSTO[interpretacion.estadoCosto]
    : 'el costo aún no se puede evaluar';
  const clausulaCronograma = interpretacion.estadoCronograma
    ? CLAUSULA_CRONOGRAMA[interpretacion.estadoCronograma]
    : 'el cronograma aún no se puede evaluar';

  return `${sujeto} y se encuentra ${ETIQUETA_ESTADO[estadoGeneral]}: ${clausulaCosto} y ${clausulaCronograma}.`;
}

export function ResumenEjecutivo(props: ResumenEjecutivoProps) {
  return (
    <div className="rounded-2xl border border-borde bg-superficie p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-apagado uppercase">Resumen ejecutivo</p>
          <p className="mt-1.5 max-w-2xl text-base text-texto">{construirResumen(props)}</p>
        </div>
        <EstadoGeneralBadge estado={props.estadoGeneral} />
      </div>
    </div>
  );
}
