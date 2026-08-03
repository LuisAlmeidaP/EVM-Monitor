import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { formatearIndice } from '../../utils/format';
import { ANIMACION_GRAFICOS_ACTIVA } from '../../utils/animacion';
import { obtenerPaletaEstado, tonoPorIndice } from '../../utils/estadoColores';

interface GraficoComparativoIndicesProps {
  readonly cpi: number | null;
  readonly spi: number | null;
}

interface PuntoIndice {
  readonly nombre: string;
  readonly valor: number;
}

const VALOR_OBJETIVO = 1;
const AMPLITUD_ESCALA_ADICIONAL = 0.2;

function TooltipIndices({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const punto = payload[0]?.payload as PuntoIndice | undefined;
  if (!punto) {
    return null;
  }

  return (
    <div className="rounded-lg border border-borde bg-superficie px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-tinta">{punto.nombre}</p>
      <p className="mt-0.5 text-apagado">Valor: {formatearIndice(punto.valor)}</p>
      <p className="text-apagado">Meta: {formatearIndice(VALOR_OBJETIVO)}</p>
    </div>
  );
}

export function GraficoComparativoIndices({ cpi, spi }: GraficoComparativoIndicesProps) {
  const datos: PuntoIndice[] = [
    { nombre: 'CPI', valor: cpi },
    { nombre: 'SPI', valor: spi },
  ].filter((entrada): entrada is PuntoIndice => entrada.valor !== null);

  if (datos.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-borde px-4 py-8 text-center text-sm text-apagado">
        Aún no hay datos suficientes para comparar CPI y SPI contra la meta.
      </div>
    );
  }

  const valorMaximo = Math.max(VALOR_OBJETIVO, ...datos.map((punto) => punto.valor)) + AMPLITUD_ESCALA_ADICIONAL;

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={datos} layout="vertical" margin={{ top: 8, right: 28, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e8e6df" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, valorMaximo]}
          tick={{ fontSize: 11, fill: '#77756a' }}
          tickFormatter={(valor: number) => valor.toFixed(1)}
        />
        <YAxis type="category" dataKey="nombre" width={40} tick={{ fontSize: 12, fill: '#3d3c37' }} />
        <Tooltip content={TooltipIndices} cursor={{ fill: '#faf9f5' }} />
        <ReferenceLine
          x={VALOR_OBJETIVO}
          stroke="#77756a"
          strokeDasharray="4 4"
          label={{ value: 'Meta 1.00', position: 'top', fontSize: 11, fill: '#77756a' }}
        />
        <Bar
          dataKey="valor"
          radius={[0, 6, 6, 0]}
          isAnimationActive={ANIMACION_GRAFICOS_ACTIVA}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {datos.map((punto) => (
            <Cell key={punto.nombre} fill={obtenerPaletaEstado(tonoPorIndice(punto.valor)).hex} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
