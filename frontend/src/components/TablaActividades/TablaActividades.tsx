import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { formatearNumero } from '../../utils/format';
import type { Actividad } from '../../types/actividad';

interface TablaActividadesProps {
  readonly actividades: Actividad[];
  readonly onEditar: (actividad: Actividad) => void;
  readonly onEliminar: (actividad: Actividad) => void;
  readonly accionVacio?: ReactNode;
}

export function TablaActividades({
  actividades,
  onEditar,
  onEliminar,
  accionVacio,
}: TablaActividadesProps) {
  if (actividades.length === 0) {
    return (
      <EmptyState
        titulo="No hay actividades registradas todavía."
        descripcion="Registre la primera actividad para comenzar a llevar el control de su avance y presupuesto."
        accion={accionVacio}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-borde bg-superficie shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-borde text-left text-xs font-medium tracking-wide text-apagado uppercase">
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3 text-right">BAC</th>
            <th className="px-4 py-3 text-right">% Planificado</th>
            <th className="px-4 py-3 text-right">% Real</th>
            <th className="px-4 py-3 text-right">Costo real</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {actividades.map((actividad) => (
            <tr key={actividad.id} className="border-b border-borde last:border-0 hover:bg-crema/60">
              <td className="px-4 py-3 font-medium text-tinta">{actividad.nombre}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatearNumero(actividad.bac)}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {actividad.porcentajeAvancePlanificado}%
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {actividad.porcentajeAvanceReal}%
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatearNumero(actividad.costoReal)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/actividades/${actividad.id}/analisis-evm`}
                    className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-apagado transition-colors hover:bg-borde/50 hover:text-tinta"
                  >
                    Ver análisis EVM
                  </Link>
                  <Button variant="ghost" onClick={() => onEditar(actividad)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    className="hover:bg-peligro-suave hover:text-peligro"
                    onClick={() => onEliminar(actividad)}
                  >
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
