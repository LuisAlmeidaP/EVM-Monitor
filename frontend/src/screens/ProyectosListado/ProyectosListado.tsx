import { useState } from 'react';
import { EstadoDeCarga } from '../../components/EstadoDeCarga/EstadoDeCarga';
import { MensajeError } from '../../components/MensajeError/MensajeError';
import { FormularioProyecto } from '../../components/FormularioProyecto/FormularioProyecto';
import { ListadoProyectos } from '../../components/ListadoProyectos/ListadoProyectos';
import { proyectosApi } from '../../api/proyectosApi';
import { obtenerMensajeDeError } from '../../api/apiError';
import { useProyectos } from './useProyectos';
import type { Proyecto } from '../../types/proyecto';

const MENSAJE_CONFIRMACION_ELIMINAR = (nombre: string): string =>
  `¿Eliminar el proyecto "${nombre}"? Esta acción no se puede deshacer.`;

type ModoFormulario = { tipo: 'creacion' } | { tipo: 'edicion'; proyecto: Proyecto };

export function ProyectosListado() {
  const { proyectos, cargando, error, crearProyecto, editarProyecto, eliminarProyecto } =
    useProyectos();

  const [modoFormulario, setModoFormulario] = useState<ModoFormulario | null>(null);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const abrirFormularioCreacion = (): void => {
    setErrorAccion(null);
    setModoFormulario({ tipo: 'creacion' });
  };

  const abrirFormularioEdicion = async (proyecto: Proyecto): Promise<void> => {
    setErrorAccion(null);
    setCargandoEdicion(true);
    try {
      const proyectoActualizado = await proyectosApi.obtener(proyecto.id);
      setModoFormulario({ tipo: 'edicion', proyecto: proyectoActualizado });
    } catch (err) {
      setErrorAccion(obtenerMensajeDeError(err));
    } finally {
      setCargandoEdicion(false);
    }
  };

  const cerrarFormulario = (): void => {
    setModoFormulario(null);
  };

  const guardarProyecto = async (nombre: string): Promise<void> => {
    if (modoFormulario?.tipo === 'edicion') {
      await editarProyecto(modoFormulario.proyecto.id, nombre);
    } else {
      await crearProyecto(nombre);
    }
    setModoFormulario(null);
  };

  const manejarEliminar = async (proyecto: Proyecto): Promise<void> => {
    const confirmado = window.confirm(MENSAJE_CONFIRMACION_ELIMINAR(proyecto.nombre));
    if (!confirmado) {
      return;
    }

    setErrorAccion(null);
    try {
      await eliminarProyecto(proyecto.id);
    } catch (err) {
      setErrorAccion(obtenerMensajeDeError(err));
    }
  };

  return (
    <section>
      <h1>Proyectos</h1>

      {errorAccion && <MensajeError mensaje={errorAccion} />}

      {!modoFormulario && (
        <button type="button" onClick={abrirFormularioCreacion}>
          Crear proyecto
        </button>
      )}

      {cargandoEdicion && <EstadoDeCarga mensaje="Cargando proyecto..." />}

      {modoFormulario && (
        <FormularioProyecto
          valorInicial={modoFormulario.tipo === 'edicion' ? modoFormulario.proyecto.nombre : ''}
          onGuardar={guardarProyecto}
          onCancelar={cerrarFormulario}
        />
      )}

      {cargando && <EstadoDeCarga mensaje="Cargando proyectos..." />}
      {error && <MensajeError mensaje={error} />}
      {!cargando && !error && (
        <ListadoProyectos
          proyectos={proyectos}
          onEditar={(proyecto) => void abrirFormularioEdicion(proyecto)}
          onEliminar={(proyecto) => void manejarEliminar(proyecto)}
        />
      )}
    </section>
  );
}
