import { obtenerPaletaEstado, tonoPorEstadoGeneral } from '../../utils/estadoColores';
import type { EstadoGeneral } from '../../types/analisisEvm';

interface EstadoGeneralBadgeProps {
  readonly estado: EstadoGeneral | null;
}

const ETIQUETAS: Record<EstadoGeneral, string> = {
  saludable: 'Saludable',
  en_riesgo: 'En riesgo',
  critico: 'Crítico',
};

const DESCRIPCIONES: Record<EstadoGeneral, string> = {
  saludable: 'La actividad va según lo planeado, o mejor, tanto en costo como en cronograma.',
  en_riesgo: 'Hay una desviación en costo o en cronograma que conviene revisar pronto.',
  critico: 'La actividad está atrasada y por encima del presupuesto. Requiere atención inmediata.',
};

const DESCRIPCION_SIN_DATOS =
  'Aún no hay suficiente información (costo real o avance planificado en cero) para determinar el estado.';

export function EstadoGeneralBadge({ estado }: EstadoGeneralBadgeProps) {
  const tono = tonoPorEstadoGeneral(estado);
  const paleta = obtenerPaletaEstado(tono);
  const etiqueta = estado === null ? 'Sin datos suficientes' : ETIQUETAS[estado];
  const descripcion = estado === null ? DESCRIPCION_SIN_DATOS : DESCRIPCIONES[estado];

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border ${paleta.claseBorde} ${paleta.claseFondoSuave} px-4 py-3`}
    >
      <span aria-hidden="true" className={`size-2.5 shrink-0 rounded-full ${paleta.claseTexto} bg-current`} />
      <div>
        <p className={`text-sm font-semibold ${paleta.claseTexto}`}>{etiqueta}</p>
        <p className="mt-0.5 text-xs text-apagado">{descripcion}</p>
      </div>
    </div>
  );
}
