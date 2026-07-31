import { EmptyState } from '../ui/EmptyState';
import { ProjectCard } from './ProjectCard';
import type { Proyecto } from '../../types/proyecto';

interface ListadoProyectosProps {
  readonly proyectos: Proyecto[];
  readonly onEditar: (proyecto: Proyecto) => void;
  readonly onEliminar: (proyecto: Proyecto) => void;
  readonly accionVacio?: React.ReactNode;
}

export function ListadoProyectos({
  proyectos,
  onEditar,
  onEliminar,
  accionVacio,
}: ListadoProyectosProps) {
  if (proyectos.length === 0) {
    return (
      <EmptyState
        titulo="No hay proyectos registrados todavía."
        descripcion="Cree su primer proyecto para comenzar a registrar actividades y dar seguimiento a su avance."
        accion={accionVacio}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {proyectos.map((proyecto) => (
        <ProjectCard
          key={proyecto.id}
          proyecto={proyecto}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}
