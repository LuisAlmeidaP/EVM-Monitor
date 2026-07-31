import { httpClient } from './httpClient';
import type { Proyecto } from '../types/proyecto';

export const proyectosApi = {
  listar(): Promise<Proyecto[]> {
    return httpClient.get<Proyecto[]>('/proyectos');
  },

  obtener(id: string): Promise<Proyecto> {
    return httpClient.get<Proyecto>(`/proyectos/${id}`);
  },

  crear(nombre: string): Promise<Proyecto> {
    return httpClient.post<Proyecto>('/proyectos', { nombre });
  },

  editar(id: string, nombre: string): Promise<Proyecto> {
    return httpClient.put<Proyecto>(`/proyectos/${id}`, { nombre });
  },

  eliminar(id: string): Promise<void> {
    return httpClient.delete<void>(`/proyectos/${id}`);
  },
};
