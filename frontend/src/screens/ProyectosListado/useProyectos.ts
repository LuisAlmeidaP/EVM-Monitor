import { useCallback, useEffect, useState } from 'react';
import { proyectosApi } from '../../api/proyectosApi';
import { obtenerMensajeDeError } from '../../api/apiError';
import type { Proyecto } from '../../types/proyecto';

interface UseProyectosResult {
  readonly proyectos: Proyecto[];
  readonly cargando: boolean;
  readonly error: string | null;
  readonly recargar: () => Promise<void>;
  readonly crearProyecto: (nombre: string) => Promise<void>;
  readonly editarProyecto: (id: string, nombre: string) => Promise<void>;
  readonly eliminarProyecto: (id: string) => Promise<void>;
}

export function useProyectos(): UseProyectosResult {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarProyectos = useCallback(async (): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const datos = await proyectosApi.listar();
      setProyectos(datos);
    } catch (err) {
      setError(obtenerMensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarProyectos();
  }, [cargarProyectos]);

  const crearProyecto = useCallback(
    async (nombre: string): Promise<void> => {
      await proyectosApi.crear(nombre);
      await cargarProyectos();
    },
    [cargarProyectos],
  );

  const editarProyecto = useCallback(
    async (id: string, nombre: string): Promise<void> => {
      await proyectosApi.editar(id, nombre);
      await cargarProyectos();
    },
    [cargarProyectos],
  );

  const eliminarProyecto = useCallback(
    async (id: string): Promise<void> => {
      await proyectosApi.eliminar(id);
      await cargarProyectos();
    },
    [cargarProyectos],
  );

  return {
    proyectos,
    cargando,
    error,
    recargar: cargarProyectos,
    crearProyecto,
    editarProyecto,
    eliminarProyecto,
  };
}
