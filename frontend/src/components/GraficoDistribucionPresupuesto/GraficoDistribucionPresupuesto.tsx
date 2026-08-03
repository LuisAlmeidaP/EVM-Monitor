import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { formatearNumero } from '../../utils/format';
import { ANIMACION_GRAFICOS_ACTIVA } from '../../utils/animacion';
import { obtenerPaletaEstado } from '../../utils/estadoColores';
import type { TonoEstado } from '../../utils/estadoColores';

interface GraficoDistribucionPresupuestoProps {
  readonly bacTotal: number;
  readonly acTotal: number;
}

interface Segmento {
  readonly nombre: string;
  readonly valor: number;
  readonly tono: TonoEstado;
}

function TooltipDistribucion({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const punto = payload[0]?.payload as Segmento | undefined;
  if (!punto) {
    return null;
  }

  return (
    <div className="rounded-lg border border-borde bg-superficie px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-tinta">{punto.nombre}</p>
      <p className="mt-0.5 text-apagado">{formatearNumero(punto.valor)}</p>
    </div>
  );
}

export function GraficoDistribucionPresupuesto({
  bacTotal,
  acTotal,
}: GraficoDistribucionPresupuestoProps) {
  if (bacTotal <= 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-borde px-4 py-8 text-center text-sm text-apagado">
        Aún no hay presupuesto registrado para visualizar la distribución.
      </div>
    );
  }

  const gastado = Math.min(acTotal, bacTotal);
  const disponible = Math.max(bacTotal - acTotal, 0);
  const sobregasto = Math.max(acTotal - bacTotal, 0);
  const porcentajeUtilizado = Math.round((acTotal / bacTotal) * 100);

  const segmentos: Segmento[] = [
    { nombre: 'Gastado', valor: gastado, tono: 'neutral' },
    ...(disponible > 0 ? [{ nombre: 'Disponible', valor: disponible, tono: 'correcto' as const }] : []),
    ...(sobregasto > 0 ? [{ nombre: 'Sobregasto', valor: sobregasto, tono: 'critico' as const }] : []),
  ];

  return (
    <div>
      <div className="relative" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={TooltipDistribucion} />
            <Pie
              data={segmentos}
              dataKey="valor"
              nameKey="nombre"
              innerRadius="70%"
              outerRadius="90%"
              paddingAngle={2}
              isAnimationActive={ANIMACION_GRAFICOS_ACTIVA}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {segmentos.map((segmento) => (
                <Cell key={segmento.nombre} fill={obtenerPaletaEstado(segmento.tono).hex} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-display text-2xl text-tinta">{porcentajeUtilizado}%</p>
          <p className="text-[11px] text-apagado">del presupuesto usado</p>
        </div>
      </div>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-apagado">
        {segmentos.map((segmento) => (
          <li key={segmento.nombre} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full"
              style={{ backgroundColor: obtenerPaletaEstado(segmento.tono).hex }}
            />
            {segmento.nombre}: {formatearNumero(segmento.valor)}
          </li>
        ))}
      </ul>
    </div>
  );
}
