import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import type { Proyecto } from '../../types/proyecto';

interface ProjectCardProps {
  readonly proyecto: Proyecto;
  readonly onEditar: (proyecto: Proyecto) => void;
  readonly onEliminar: (proyecto: Proyecto) => void;
}

export function ProjectCard({ proyecto, onEditar, onEliminar }: ProjectCardProps) {
  const inicial = proyecto.nombre.charAt(0).toUpperCase();

  return (
    <article className="group flex flex-col justify-between gap-4 rounded-2xl border border-borde bg-superficie p-5 shadow-sm transition-shadow hover:shadow-md">
      <Link
        to={`/proyectos/${proyecto.id}/actividades`}
        className="flex items-start gap-3.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
      >
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-acento-suave font-display text-lg text-acento"
        >
          {inicial}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg text-tinta" title={proyecto.nombre}>
            {proyecto.nombre}
          </h3>
          <p className="mt-0.5 truncate text-xs text-apagado" title={proyecto.id}>
            ID: {proyecto.id}
          </p>
          <p className="mt-1 text-xs font-medium text-acento">Ver actividades →</p>
        </div>
      </Link>
      <div className="flex justify-end gap-2 border-t border-borde pt-3.5">
        <Button variant="ghost" onClick={() => onEditar(proyecto)}>
          Editar
        </Button>
        <Button
          variant="ghost"
          className="hover:bg-peligro-suave hover:text-peligro"
          onClick={() => onEliminar(proyecto)}
        >
          Eliminar
        </Button>
      </div>
    </article>
  );
}
