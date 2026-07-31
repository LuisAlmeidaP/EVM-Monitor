import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { formatearIndice } from '../../utils/format';
import { ANIMACION_GRAFICOS_ACTIVA } from '../../utils/animacion';
import { obtenerPaletaEstado, tonoPorIndice } from '../../utils/estadoColores';

interface GaugeIndiceEvmProps {
  readonly etiqueta: string;
  readonly descripcion: string;
  readonly valor: number | null;
}

const ESCALA_MAXIMA = 2;
const VALOR_OBJETIVO = 1;
const ALTURA_GAUGE = 150;

export function GaugeIndiceEvm({ etiqueta, descripcion, valor }: GaugeIndiceEvmProps) {
  const tono = tonoPorIndice(valor);
  const paleta = obtenerPaletaEstado(tono);

  return (
    <div className="rounded-2xl border border-borde bg-superficie p-4 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-apagado uppercase">{etiqueta}</p>

      {valor === null ? (
        <div
          className="flex flex-col items-center justify-center gap-1 text-center"
          style={{ height: ALTURA_GAUGE }}
        >
          <p className="font-display text-3xl text-apagado">N/D</p>
          <p className="text-[11px] text-apagado">Datos insuficientes</p>
        </div>
      ) : (
        <div className="relative" style={{ height: ALTURA_GAUGE }} data-testid={`gauge-${etiqueta}`}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={[{ nombre: etiqueta, valor: Math.min(valor, ESCALA_MAXIMA) }]}
              startAngle={180}
              endAngle={0}
              cx="50%"
              cy="82%"
              innerRadius="72%"
              outerRadius="100%"
              barSize={16}
            >
              <PolarAngleAxis type="number" domain={[0, ESCALA_MAXIMA]} angleAxisId={0} tick={false} />
              <RadialBar
                dataKey="valor"
                background={{ fill: '#e8e6df' }}
                cornerRadius={8}
                fill={paleta.hex}
                isAnimationActive={ANIMACION_GRAFICOS_ACTIVA}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-1 text-center">
            <p className={`font-display text-3xl ${paleta.claseTexto}`}>{formatearIndice(valor)}</p>
            <p className="text-[11px] text-apagado">Meta: {formatearIndice(VALOR_OBJETIVO)}</p>
          </div>
        </div>
      )}

      <p className="mt-1 text-center text-xs text-apagado">{descripcion}</p>
    </div>
  );
}
