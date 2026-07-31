import type { Proyecto } from '../../types/proyecto';

interface ListadoProyectosProps {
  readonly proyectos: Proyecto[];
  readonly onEditar: (proyecto: Proyecto) => void;
  readonly onEliminar: (proyecto: Proyecto) => void;
}

export function ListadoProyectos({ proyectos, onEditar, onEliminar }: ListadoProyectosProps) {
  if (proyectos.length === 0) {
    return <p>No hay proyectos registrados todavía.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {proyectos.map((proyecto) => (
          <tr key={proyecto.id}>
            <td>{proyecto.nombre}</td>
            <td>
              <button type="button" onClick={() => onEditar(proyecto)}>
                Editar
              </button>
              <button type="button" onClick={() => onEliminar(proyecto)}>
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
