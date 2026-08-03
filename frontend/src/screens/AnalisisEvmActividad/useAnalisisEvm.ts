import { useCallback, useEffect, useState } from 'react';
import { actividadesApi } from '../../api/actividadesApi';
import { obtenerMensajeDeError } from '../../api/apiError';
import type { AnalisisEvmActividad } from '../../types/analisisEvm';

interface UseAnalisisEvmResult {
  readonly analisis: AnalisisEvmActividad | null;
  readonly cargando: boolean;
  readonly error: string | null;
  readonly recargar: () => Promise<void>;
}

export function useAnalisisEvm(actividadId: string): UseAnalisisEvmResult {
  const [analisis, setAnalisis] = useState<AnalisisEvmActividad | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarAnalisis = useCallback(async (): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const datos = await actividadesApi.obtenerAnalisisEvm(actividadId);
      setAnalisis(datos);
    } catch (err) {
      setError(obtenerMensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [actividadId]);

  useEffect(() => {
    void cargarAnalisis();
  }, [cargarAnalisis]);

  return { analisis, cargando, error, recargar: cargarAnalisis };
}
