import { useCallback, useEffect, useState } from 'react';
import { actividadesApi } from '../../api/actividadesApi';
import { obtenerMensajeDeError } from '../../api/apiError';
import type { Actividad, ActividadInput } from '../../types/actividad';

interface UseActividadesResult {
  readonly actividades: Actividad[];
  readonly cargando: boolean;
  readonly error: string | null;
  readonly recargar: () => Promise<void>;
  readonly crearActividad: (datos: ActividadInput) => Promise<void>;
  readonly editarActividad: (id: string, datos: ActividadInput) => Promise<void>;
  readonly eliminarActividad: (id: string) => Promise<void>;
}

export function useActividades(proyectoId: string): UseActividadesResult {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarActividades = useCallback(async (): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const datos = await actividadesApi.listarPorProyecto(proyectoId);
      setActividades(datos);
    } catch (err) {
      setError(obtenerMensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [proyectoId]);

  useEffect(() => {
    void cargarActividades();
  }, [cargarActividades]);

  const crearActividad = useCallback(
    async (datos: ActividadInput): Promise<void> => {
      await actividadesApi.crear(proyectoId, datos);
      await cargarActividades();
    },
    [proyectoId, cargarActividades],
  );

  const editarActividad = useCallback(
    async (id: string, datos: ActividadInput): Promise<void> => {
      await actividadesApi.editar(id, datos);
      await cargarActividades();
    },
    [cargarActividades],
  );

  const eliminarActividad = useCallback(
    async (id: string): Promise<void> => {
      await actividadesApi.eliminar(id);
      await cargarActividades();
    },
    [cargarActividades],
  );

  return {
    actividades,
    cargando,
    error,
    recargar: cargarActividades,
    crearActividad,
    editarActividad,
    eliminarActividad,
  };
}
