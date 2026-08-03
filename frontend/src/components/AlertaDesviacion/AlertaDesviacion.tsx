import { formatearNumero } from '../../utils/format';
import type { EstadoCosto, EstadoCronograma } from '../../types/analisisEvm';

interface AlertaDesviacionProps {
  readonly cv: number;
  readonly sv: number;
  readonly estadoCosto: EstadoCosto | null;
  readonly estadoCronograma: EstadoCronograma | null;
}

interface Alerta {
  readonly id: string;
  readonly mensaje: string;
}

function construirAlertas({ cv, sv, estadoCosto, estadoCronograma }: AlertaDesviacionProps): Alerta[] {
  const alertas: Alerta[] = [];

  if (estadoCosto === 'sobre_presupuesto') {
    alertas.push({
      id: 'costo',
      mensaje: `Sobrecosto: el costo real supera en ${formatearNumero(Math.abs(cv))} al valor ganado por el avance logrado.`,
    });
  }

  if (estadoCronograma === 'atrasado') {
    alertas.push({
      id: 'cronograma',
      mensaje: `Retraso: el avance real equivale a ${formatearNumero(Math.abs(sv))} menos de lo que debería llevarse a esta fecha.`,
    });
  }

  return alertas;
}

export function AlertaDesviacion(props: AlertaDesviacionProps) {
  const alertas = construirAlertas(props);

  if (alertas.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {alertas.map((alerta) => (
        <div
          key={alerta.id}
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-advertencia/25 bg-advertencia-suave px-4 py-3 text-sm text-advertencia"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          <span>{alerta.mensaje}</span>
        </div>
      ))}
    </div>
  );
}
