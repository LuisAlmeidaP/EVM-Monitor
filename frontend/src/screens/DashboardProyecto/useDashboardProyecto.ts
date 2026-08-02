import { useCallback, useEffect, useState } from 'react';
import { actividadesApi } from '../../api/actividadesApi';
import { proyectosApi } from '../../api/proyectosApi';
import { obtenerMensajeDeError } from '../../api/apiError';
import type { Actividad } from '../../types/actividad';
import type { AnalisisConsolidadoProyecto } from '../../types/analisisEvm';
import type { Proyecto } from '../../types/proyecto';

interface UseDashboardProyectoResult {
  readonly proyecto: Proyecto | null;
  readonly analisis: AnalisisConsolidadoProyecto | null;
  readonly actividades: Actividad[];
  readonly cargando: boolean;
  readonly error: string | null;
  readonly recargar: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (): Promise<void> => {
    setCargando(true);
    setError(null);
    setAnalisis(null);
    try {
      const [datosProyecto, datosActividades] = await Promise.all([
        proyectosApi.obtener(proyectoId),
        actividadesApi.listarPorProyecto(proyectoId),
      ]);
      setProyecto(datosProyecto);
      setActividades(datosActividades);

      if (datosActividades.length > 0) {
        const datosAnalisis = await proyectosApi.obtenerAnalisisEvm(proyectoId);
        setAnalisis(datosAnalisis);
      }
    } catch (err) {
      setError(obtenerMensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [proyectoId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return { proyecto, analisis, actividades, cargando, error, recargar: cargar };
}
