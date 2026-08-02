import { useCallback, useEffect, useState } from 'react';
import { actividadesApi } from '../../api/actividadesApi';
import { proyectosApi } from '../../api/proyectosApi';
import { obtenerMensajeDeError } from '../../api/apiError';
import type { Actividad, ActividadInput } from '../../types/actividad';
import type { AnalisisConsolidadoProyecto } from '../../types/analisisEvm';
import type { Proyecto } from '../../types/proyecto';

interface UseDashboardProyectoResult {
  readonly proyecto: Proyecto | null;
  readonly analisis: AnalisisConsolidadoProyecto | null;
  readonly actividades: Actividad[];
  readonly cargando: boolean;
  readonly actualizando: boolean;
  readonly error: string | null;
  readonly recargar: () => Promise<void>;
  readonly crearActividad: (datos: ActividadInput) => Promise<void>;
  readonly editarActividad: (id: string, datos: ActividadInput) => Promise<void>;
  readonly eliminarActividad: (id: string) => Promise<void>;
}

/**
 * El análisis consolidado (GET /proyectos/:id/analisis-evm) falla con 422
 * cuando el proyecto no tiene actividades. En vez de disparar esa llamada y
 * capturar el error, se consulta primero la lista de actividades (ya
 * necesaria para la tabla) y solo se pide el análisis si hay al menos una.
 */
export function useDashboardProyecto(proyectoId: string): UseDashboardProyectoResult {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [analisis, setAnalisis] = useState<AnalisisConsolidadoProyecto | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarDatosEvm = useCallback(async (): Promise<void> => {
    const datosActividades = await actividadesApi.listarPorProyecto(proyectoId);
    setActividades(datosActividades);

    if (datosActividades.length > 0) {
      const datosAnalisis = await proyectosApi.obtenerAnalisisEvm(proyectoId);
      setAnalisis(datosAnalisis);
    } else {
      setAnalisis(null);
    }
  }, [proyectoId]);

  const cargarTodo = useCallback(async (): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const datosProyecto = await proyectosApi.obtener(proyectoId);
      setProyecto(datosProyecto);
      await cargarDatosEvm();
    } catch (err) {
      setError(obtenerMensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [proyectoId, cargarDatosEvm]);

  useEffect(() => {
    void cargarTodo();
  }, [cargarTodo]);

  /**
   * Tras una mutación solo se vuelven a pedir actividades + análisis (no el
   * proyecto, cuyo nombre no cambia desde aquí) y sin activar `cargando`: el
   * contenido ya renderizado permanece visible mientras se actualiza, en vez
   * de taparlo con la pantalla de carga inicial en cada edición.
   */
  const recargarDatosEvm = useCallback(async (): Promise<void> => {
    setActualizando(true);
    try {
      await cargarDatosEvm();
    } catch (err) {
      setError(obtenerMensajeDeError(err));
    } finally {
      setActualizando(false);
    }
  }, [cargarDatosEvm]);

  const crearActividad = useCallback(
    async (datos: ActividadInput): Promise<void> => {
      await actividadesApi.crear(proyectoId, datos);
      await recargarDatosEvm();
    },
    [proyectoId, recargarDatosEvm],
  );

  const editarActividad = useCallback(
    async (id: string, datos: ActividadInput): Promise<void> => {
      await actividadesApi.editar(id, datos);
      await recargarDatosEvm();
    },
    [recargarDatosEvm],
  );

  const eliminarActividad = useCallback(
    async (id: string): Promise<void> => {
      await actividadesApi.eliminar(id);
      await recargarDatosEvm();
    },
    [recargarDatosEvm],
  );

  return {
    proyecto,
    analisis,
    actividades,
    cargando,
    actualizando,
    error,
    recargar: cargarTodo,
    crearActividad,
    editarActividad,
    eliminarActividad,
  };
}
