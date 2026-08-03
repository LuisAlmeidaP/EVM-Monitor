import { httpClient } from './httpClient';
import type { Actividad, ActividadInput } from '../types/actividad';
import type { AnalisisEvmActividad } from '../types/analisisEvm';

export const actividadesApi = {
  listarPorProyecto(proyectoId: string): Promise<Actividad[]> {
    return httpClient.get<Actividad[]>(`/proyectos/${proyectoId}/actividades`);
  },

  obtener(id: string): Promise<Actividad> {
    return httpClient.get<Actividad>(`/actividades/${id}`);
  },

  obtenerAnalisisEvm(id: string): Promise<AnalisisEvmActividad> {
    return httpClient.get<AnalisisEvmActividad>(`/actividades/${id}/analisis-evm`);
  },

  crear(proyectoId: string, datos: ActividadInput): Promise<Actividad> {
    return httpClient.post<Actividad>(`/proyectos/${proyectoId}/actividades`, datos);
  },

  editar(id: string, datos: ActividadInput): Promise<Actividad> {
    return httpClient.put<Actividad>(`/actividades/${id}`, datos);
  },

  eliminar(id: string): Promise<void> {
    return httpClient.delete<void>(`/actividades/${id}`);
  },
};
