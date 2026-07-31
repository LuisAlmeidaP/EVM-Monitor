import { obtenerPaletaEstado } from '../../utils/estadoColores';
import type { TonoEstado } from '../../utils/estadoColores';

interface IndicadorEvmProps {
  readonly etiqueta: string;
  readonly valor: string;
  readonly descripcion: string;
  readonly tono?: TonoEstado;
}

export function IndicadorEvm({ etiqueta, valor, descripcion, tono = 'neutral' }: IndicadorEvmProps) {
  const paleta = obtenerPaletaEstado(tono);

  return (
    <div className="rounded-2xl border border-borde bg-superficie p-4 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-xs font-medium tracking-wide text-apagado uppercase">{etiqueta}</p>
      <p className={`mt-1.5 font-display text-2xl ${paleta.claseTexto}`}>{valor}</p>
      <p className="mt-1 text-xs text-apagado">{descripcion}</p>
    </div>
  );
}
