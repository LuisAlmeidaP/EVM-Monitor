import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DefaultLegendContentProps, TooltipContentProps } from 'recharts';
import { formatearNumero } from '../../utils/format';
import { ANIMACION_GRAFICOS_ACTIVA } from '../../utils/animacion';
import { obtenerPaletaEstado, tonoPorEstadoCosto, tonoPorEstadoCronograma } from '../../utils/estadoColores';
import type { TonoEstado } from '../../utils/estadoColores';
import type { EstadoCosto, EstadoCronograma } from '../../types/analisisEvm';

interface GraficoValorEvmProps {
  readonly pv: number;
  readonly ev: number;
  readonly ac: number;
  readonly bac: number;
  readonly estadoCosto: EstadoCosto | null;
  readonly estadoCronograma: EstadoCronograma | null;
}

interface PuntoValor {
  readonly nombre: string;
  readonly descripcion: string;
  readonly valor: number;
  readonly tono: TonoEstado;
}

function TooltipValor({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const punto = payload[0]?.payload as PuntoValor | undefined;
  if (!punto) {
    return null;
  }

  return (
    <div className="rounded-lg border border-borde bg-superficie px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-tinta">{punto.nombre}</p>
      <p className="mt-0.5 text-apagado">{punto.descripcion}</p>
      <p className="mt-1 font-medium text-tinta">{formatearNumero(punto.valor)}</p>
    </div>
  );
}

function LeyendaValor({ payload }: DefaultLegendContentProps) {
  return (
    <ul className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-apagado">
      {payload?.map((entrada) => (
        <li key={entrada.value as string} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full"
            style={{ backgroundColor: entrada.color }}
          />
          {entrada.value}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-0 w-3 border-t-2 border-dashed border-apagado" />
        Presupuesto total (BAC)
      </li>
    </ul>
  );
}

export function GraficoValorEvm({ pv, ev, ac, bac, estadoCosto, estadoCronograma }: GraficoValorEvmProps) {
  const datos: PuntoValor[] = [
    {
      nombre: 'PV',
      descripcion: 'Valor planificado a la fecha',
      valor: pv,
      tono: 'neutral',
    },
    {
      nombre: 'EV',
      descripcion: 'Valor ganado según el avance real',
      valor: ev,
      tono: tonoPorEstadoCronograma(estadoCronograma),
    },
    {
      nombre: 'AC',
      descripcion: 'Costo real incurrido',
      valor: ac,
      tono: tonoPorEstadoCosto(estadoCosto),
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={datos} margin={{ top: 12, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e6df" vertical={false} />
        <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: '#3d3c37' }} />
        <YAxis
          domain={[0, (dataMax: number) => Math.max(dataMax, bac) * 1.1]}
          tick={{ fontSize: 11, fill: '#77756a' }}
          tickFormatter={(valor: number) => formatearNumero(valor)}
          width={70}
        />
        <Tooltip content={TooltipValor} cursor={{ fill: '#faf9f5' }} />
        <Legend content={LeyendaValor} />
        <ReferenceLine
          y={bac}
          ifOverflow="extendDomain"
          stroke="#c96442"
          strokeDasharray="4 4"
          label={{ value: 'BAC', position: 'insideTopRight', fontSize: 11, fill: '#c96442' }}
        />
        <Bar
          dataKey="valor"
          name="Valor"
          radius={[6, 6, 0, 0]}
          isAnimationActive={ANIMACION_GRAFICOS_ACTIVA}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {datos.map((punto) => (
            <Cell key={punto.nombre} fill={obtenerPaletaEstado(punto.tono).hex} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
