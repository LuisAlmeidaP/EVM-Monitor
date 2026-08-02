import { useCallback, useEffect, useState } from 'react';
import { actividadesApi } from '../../api/actividadesApi';
import { proyectosApi } from '../../api/proyectosApi';
import { obtenerMensajeDeError } from '../../api/apiError';
import type { Actividad, ActividadInput } from '../../types/actividad';
import type { ActividadComparativaEvm, AnalisisConsolidadoProyecto } from '../../types/analisisEvm';
import type { Proyecto } from '../../types/proyecto';

interface UseDashboardProyectoResult {
  readonly proyecto: Proyecto | null;
  readonly analisis: AnalisisConsolidadoProyecto | null;
  readonly actividades: Actividad[];
  readonly comparativoActividades: ActividadComparativaEvm[];
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
  const [comparativoActividades, setComparativoActividades] = useState<ActividadComparativaEvm[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * PV y EV por actividad son indicadores calculados por el backend, no
   * campos crudos: se obtienen del mismo endpoint de análisis por actividad
   * ya usado desde F7.2 (GET /actividades/:id/analisis-evm), uno por
   * actividad en paralelo — reutiliza datos ya expuestos por la aplicación
   * en vez de recalcular la fórmula EVM en el frontend.
   */
  const cargarDatosEvm = useCallback(async (): Promise<void> => {
    const datosActividades = await actividadesApi.listarPorProyecto(proyectoId);
    setActividades(datosActividades);

    if (datosActividades.length === 0) {
      setAnalisis(null);
      setComparativoActividades([]);
      return;
    }

    const [datosAnalisis, analisisPorActividad] = await Promise.all([
      proyectosApi.obtenerAnalisisEvm(proyectoId),
      Promise.all(
        datosActividades.map((actividad) => actividadesApi.obtenerAnalisisEvm(actividad.id)),
      ),
    ]);
    setAnalisis(datosAnalisis);
    setComparativoActividades(
      datosActividades.map((actividad, indice) => {
        const analisisActividad = analisisPorActividad[indice];
        return {
          id: actividad.id,
          nombre: actividad.nombre,
          pv: analisisActividad.indicadores.pv,
          ev: analisisActividad.indicadores.ev,
          ac: actividad.costoReal,
          cv: analisisActividad.indicadores.cv,
          sv: analisisActividad.indicadores.sv,
          estadoGeneral: analisisActividad.estadoGeneral,
        };
      }),
    );
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
    comparativoActividades,
    cargando,
    actualizando,
    error,
    recargar: cargarTodo,
    crearActividad,
    editarActividad,
    eliminarActividad,
  };
}
