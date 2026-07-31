import { obtenerPaletaEstado } from '../../utils/estadoColores';
import type { TonoEstado } from '../../utils/estadoColores';
import type { EstadoCosto, EstadoCronograma, InterpretacionEvm as InterpretacionEvmData } from '../../types/analisisEvm';

interface InterpretacionEvmProps {
  readonly interpretacion: InterpretacionEvmData;
}

const MENSAJES_COSTO: Record<EstadoCosto, { texto: string; tono: TonoEstado }> = {
  bajo_presupuesto: { texto: 'Se está gastando menos de lo planeado para el avance logrado.', tono: 'correcto' },
  en_presupuesto: { texto: 'El gasto coincide con lo planeado para el avance logrado.', tono: 'correcto' },
  sobre_presupuesto: { texto: 'Se está gastando más de lo planeado para el avance logrado.', tono: 'critico' },
};

const MENSAJES_CRONOGRAMA: Record<EstadoCronograma, { texto: string; tono: TonoEstado }> = {
  adelantado: { texto: 'El avance real supera al avance planificado.', tono: 'correcto' },
  a_tiempo: { texto: 'El avance real coincide con el avance planificado.', tono: 'correcto' },
  atrasado: { texto: 'El avance real está por debajo del avance planificado.', tono: 'critico' },
};

const MENSAJE_COSTO_SIN_DATOS = 'No se puede evaluar el costo todavía: el costo real registrado es cero.';
const MENSAJE_CRONOGRAMA_SIN_DATOS =
  'No se puede evaluar el cronograma todavía: el avance planificado registrado es cero.';

export function InterpretacionEvm({ interpretacion }: InterpretacionEvmProps) {
  const costo = interpretacion.estadoCosto
    ? MENSAJES_COSTO[interpretacion.estadoCosto]
    : { texto: MENSAJE_COSTO_SIN_DATOS, tono: 'neutral' as const };
  const cronograma = interpretacion.estadoCronograma
    ? MENSAJES_CRONOGRAMA[interpretacion.estadoCronograma]
    : { texto: MENSAJE_CRONOGRAMA_SIN_DATOS, tono: 'neutral' as const };

  return (
    <div className="rounded-2xl border border-borde bg-superficie p-5 shadow-sm">
      <p className="font-display text-lg text-tinta">Qué significa esto</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        <li className="flex items-start gap-2.5 text-sm text-texto">
          <span
            aria-hidden="true"
            className={`mt-1.5 size-2 shrink-0 rounded-full ${obtenerPaletaEstado(costo.tono).claseTexto} bg-current`}
          />
          <span>
            <span className="font-medium text-tinta">Costo: </span>
            {costo.texto}
          </span>
        </li>
        <li className="flex items-start gap-2.5 text-sm text-texto">
          <span
            aria-hidden="true"
            className={`mt-1.5 size-2 shrink-0 rounded-full ${obtenerPaletaEstado(cronograma.tono).claseTexto} bg-current`}
          />
          <span>
            <span className="font-medium text-tinta">Cronograma: </span>
            {cronograma.texto}
          </span>
        </li>
      </ul>
    </div>
  );
}
