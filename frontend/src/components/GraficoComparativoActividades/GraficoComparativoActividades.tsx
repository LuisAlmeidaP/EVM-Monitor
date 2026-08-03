import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { formatearNumero } from '../../utils/format';
import { ANIMACION_GRAFICOS_ACTIVA } from '../../utils/animacion';
import { obtenerPaletaEstado, tonoPorEstadoGeneral } from '../../utils/estadoColores';
import type { ActividadComparativaEvm } from '../../types/analisisEvm';

interface GraficoComparativoActividadesProps {
  readonly actividades: ActividadComparativaEvm[];
}

type OrdenComparativa = 'nombre' | 'desviacion';

const ALTURA_MINIMA = 200;
const ALTURA_POR_ACTIVIDAD = 64;

const COLOR_PV = '#77756a';
const COLOR_EV = '#3e6837';
const COLOR_AC = '#c96442';

const ETIQUETA_ESTADO: Record<'saludable' | 'en_riesgo' | 'critico', string> = {
  saludable: 'Saludable',
  en_riesgo: 'En riesgo',
  critico: 'Crítico',
};

function ordenarActividades(
  actividades: ActividadComparativaEvm[],
  orden: OrdenComparativa,
): ActividadComparativaEvm[] {
  const copia = [...actividades];

  if (orden === 'desviacion') {
    return copia.sort(
      (a, b) => Math.abs(b.cv) + Math.abs(b.sv) - (Math.abs(a.cv) + Math.abs(a.sv)),
    );
  }

  return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function TooltipComparativa({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const fila = payload[0]?.payload as ActividadComparativaEvm | undefined;
  if (!fila) {
    return null;
  }

  const tonoEstado = tonoPorEstadoGeneral(fila.estadoGeneral);
  const etiquetaEstado = fila.estadoGeneral ? ETIQUETA_ESTADO[fila.estadoGeneral] : 'Sin datos suficientes';

  return (
    <div className="rounded-lg border border-borde bg-superficie px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-tinta">{fila.nombre}</p>
      <p className="mt-1 text-apagado">PV: {formatearNumero(fila.pv)}</p>
      <p className="text-apagado">EV: {formatearNumero(fila.ev)}</p>
      <p className="text-apagado">AC: {formatearNumero(fila.ac)}</p>
      <p className={`mt-1 font-medium ${obtenerPaletaEstado(tonoEstado).claseTexto}`}>{etiquetaEstado}</p>
    </div>
  );
}

function LeyendaComparativa() {
  const entradas = [
    { etiqueta: 'PV — Valor planificado', color: COLOR_PV },
    { etiqueta: 'EV — Valor ganado', color: COLOR_EV },
    { etiqueta: 'AC — Costo real', color: COLOR_AC },
  ];

  return (
    <ul className="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-apagado">
      {entradas.map((entrada) => (
        <li key={entrada.etiqueta} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: entrada.color }} />
          {entrada.etiqueta}
        </li>
      ))}
    </ul>
  );
}

export function GraficoComparativoActividades({ actividades }: GraficoComparativoActividadesProps) {
  const [orden, setOrden] = useState<OrdenComparativa>('nombre');

  if (actividades.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-borde px-4 py-8 text-center text-sm text-apagado">
        Aún no hay actividades registradas para comparar PV, EV y AC.
      </div>
    );
  }

  const datos = ordenarActividades(actividades, orden);
  const altura = Math.max(ALTURA_MINIMA, datos.length * ALTURA_POR_ACTIVIDAD);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <LeyendaComparativa />
        <label className="flex shrink-0 items-center gap-2 text-xs text-apagado">
          Ordenar por
          <select
            value={orden}
            onChange={(evento) => setOrden(evento.target.value as OrdenComparativa)}
            className="rounded-lg border border-borde bg-superficie px-2 py-1 text-xs text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
          >
            <option value="nombre">Nombre (A-Z)</option>
            <option value="desviacion">Mayor desviación primero</option>
          </select>
        </label>
      </div>

      <ResponsiveContainer width="100%" height={altura}>
        <BarChart data={datos} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e6df" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#77756a' }}
            tickFormatter={(valor: number) => formatearNumero(valor)}
          />
          <YAxis
            type="category"
            dataKey="nombre"
            width={110}
            tick={{ fontSize: 12, fill: '#3d3c37' }}
          />
          <Tooltip content={TooltipComparativa} cursor={{ fill: '#faf9f5' }} />
          <Bar
            dataKey="pv"
            name="PV"
            fill={COLOR_PV}
            radius={[0, 4, 4, 0]}
            isAnimationActive={ANIMACION_GRAFICOS_ACTIVA}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="ev"
            name="EV"
            fill={COLOR_EV}
            radius={[0, 4, 4, 0]}
            isAnimationActive={ANIMACION_GRAFICOS_ACTIVA}
            animationDuration={800}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="ac"
            name="AC"
            fill={COLOR_AC}
            radius={[0, 4, 4, 0]}
            isAnimationActive={ANIMACION_GRAFICOS_ACTIVA}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
