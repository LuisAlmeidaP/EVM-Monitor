import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { EstadoDeCarga } from '../../components/EstadoDeCarga/EstadoDeCarga';
import { MensajeError } from '../../components/MensajeError/MensajeError';
import { FormularioProyecto } from '../../components/FormularioProyecto/FormularioProyecto';
import { ListadoProyectos } from '../../components/ListadoProyectos/ListadoProyectos';
import { proyectosApi } from '../../api/proyectosApi';
import { obtenerMensajeDeError } from '../../api/apiError';
import { useProyectos } from './useProyectos';
import type { Proyecto } from '../../types/proyecto';

type ModoFormulario = { tipo: 'creacion' } | { tipo: 'edicion'; proyecto: Proyecto };

export function ProyectosListado() {
  const { proyectos, cargando, error, crearProyecto, editarProyecto, eliminarProyecto } =
    useProyectos();

  const [modoFormulario, setModoFormulario] = useState<ModoFormulario | null>(null);
  const [proyectoAEliminar, setProyectoAEliminar] = useState<Proyecto | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

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
      setMensajeExito('Proyecto actualizado correctamente.');
    } else {
      await crearProyecto(nombre);
      setMensajeExito('Proyecto creado correctamente.');
    }
    setModoFormulario(null);
  };

  const confirmarEliminacion = async (): Promise<void> => {
    if (!proyectoAEliminar) {
      return;
    }

    setErrorAccion(null);
    setEliminando(true);
    try {
      await eliminarProyecto(proyectoAEliminar.id);
      setMensajeExito('Proyecto eliminado correctamente.');
      setProyectoAEliminar(null);
    } catch (err) {
      setErrorAccion(obtenerMensajeDeError(err));
      setProyectoAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const tituloFormulario =
    modoFormulario?.tipo === 'edicion' ? 'Editar proyecto' : 'Nuevo proyecto';

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-tinta">Proyectos</h1>
          <p className="mt-1.5 text-sm text-apagado">
            Gestione sus proyectos y dé seguimiento a su avance y presupuesto.
          </p>
        </div>
        <Button onClick={abrirFormularioCreacion}>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4"
            aria-hidden="true"
          >
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Crear proyecto
        </Button>
      </header>

      {errorAccion && (
        <div className="mb-6">
          <MensajeError mensaje={errorAccion} />
        </div>
      )}

      {cargandoEdicion && <EstadoDeCarga mensaje="Cargando proyecto..." />}

      {cargando && <EstadoDeCarga mensaje="Cargando proyectos..." />}
      {error && <MensajeError mensaje={error} />}
      {!cargando && !error && (
        <ListadoProyectos
          proyectos={proyectos}
          onEditar={(proyecto) => void abrirFormularioEdicion(proyecto)}
          onEliminar={(proyecto) => setProyectoAEliminar(proyecto)}
          accionVacio={
            <Button variant="secondary" onClick={abrirFormularioCreacion}>
              Crear el primer proyecto
            </Button>
          }
        />
      )}

      {modoFormulario && (
        <Modal titulo={tituloFormulario} onCerrar={cerrarFormulario}>
          <FormularioProyecto
            valorInicial={modoFormulario.tipo === 'edicion' ? modoFormulario.proyecto.nombre : ''}
            onGuardar={guardarProyecto}
            onCancelar={cerrarFormulario}
          />
        </Modal>
      )}

      {proyectoAEliminar && (
        <ConfirmDialog
          titulo="Eliminar proyecto"
          descripcion={`¿Eliminar el proyecto "${proyectoAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          etiquetaConfirmar="Eliminar proyecto"
          confirmando={eliminando}
          onConfirmar={() => void confirmarEliminacion()}
          onCancelar={() => setProyectoAEliminar(null)}
        />
      )}

      {mensajeExito && <Toast mensaje={mensajeExito} onCerrar={() => setMensajeExito(null)} />}
    </main>
  );
}
