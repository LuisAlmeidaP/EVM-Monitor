import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { EstadoDeCarga } from '../../components/EstadoDeCarga/EstadoDeCarga';
import { MensajeError } from '../../components/MensajeError/MensajeError';
import { FormularioActividad } from '../../components/FormularioActividad/FormularioActividad';
import { TablaActividades } from '../../components/TablaActividades/TablaActividades';
import { proyectosApi } from '../../api/proyectosApi';
import { actividadesApi } from '../../api/actividadesApi';
import { obtenerMensajeDeError } from '../../api/apiError';
import { useActividades } from './useActividades';
import type { Actividad, ActividadInput } from '../../types/actividad';
import type { Proyecto } from '../../types/proyecto';

type ModoFormulario = { tipo: 'creacion' } | { tipo: 'edicion'; actividad: Actividad };

export function ActividadesListado() {
  const { proyectoId } = useParams<{ proyectoId: string }>();

  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [cargandoProyecto, setCargandoProyecto] = useState(true);
  const [errorProyecto, setErrorProyecto] = useState<string | null>(null);

  const { actividades, cargando, error, crearActividad, editarActividad, eliminarActividad } =
    useActividades(proyectoId ?? '');

  const [modoFormulario, setModoFormulario] = useState<ModoFormulario | null>(null);
  const [actividadAEliminar, setActividadAEliminar] = useState<Actividad | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    if (!proyectoId) {
      return;
    }

    let cancelado = false;
    setCargandoProyecto(true);
    setErrorProyecto(null);

    proyectosApi
      .obtener(proyectoId)
      .then((datos) => {
        if (!cancelado) {
          setProyecto(datos);
        }
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setErrorProyecto(obtenerMensajeDeError(err));
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargandoProyecto(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [proyectoId]);

  if (!proyectoId) {
    return <MensajeError mensaje="No se especificó un proyecto válido." />;
  }

  const abrirFormularioCreacion = (): void => {
    setErrorAccion(null);
    setModoFormulario({ tipo: 'creacion' });
  };

  const abrirFormularioEdicion = async (actividad: Actividad): Promise<void> => {
    setErrorAccion(null);
    setCargandoEdicion(true);
    try {
      const actividadActualizada = await actividadesApi.obtener(actividad.id);
      setModoFormulario({ tipo: 'edicion', actividad: actividadActualizada });
    } catch (err) {
      setErrorAccion(obtenerMensajeDeError(err));
    } finally {
      setCargandoEdicion(false);
    }
  };

  const cerrarFormulario = (): void => {
    setModoFormulario(null);
  };

  const guardarActividad = async (datos: ActividadInput): Promise<void> => {
    if (modoFormulario?.tipo === 'edicion') {
      await editarActividad(modoFormulario.actividad.id, datos);
      setMensajeExito('Actividad actualizada correctamente.');
    } else {
      await crearActividad(datos);
      setMensajeExito('Actividad creada correctamente.');
    }
    setModoFormulario(null);
  };

  const confirmarEliminacion = async (): Promise<void> => {
    if (!actividadAEliminar) {
      return;
    }

    setErrorAccion(null);
    setEliminando(true);
    try {
      await eliminarActividad(actividadAEliminar.id);
      setMensajeExito('Actividad eliminada correctamente.');
      setActividadAEliminar(null);
    } catch (err) {
      setErrorAccion(obtenerMensajeDeError(err));
      setActividadAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const tituloFormulario =
    modoFormulario?.tipo === 'edicion' ? 'Editar actividad' : 'Nueva actividad';

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/" className="text-sm text-apagado hover:text-acento">
        ← Volver a proyectos
      </Link>

      <header className="mt-3 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-tinta">
            {cargandoProyecto ? 'Actividades' : (proyecto?.nombre ?? 'Actividades')}
          </h1>
          <p className="mt-1.5 text-sm text-apagado">
            Registre y edite las actividades de este proyecto.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/proyectos/${proyectoId}/dashboard`}>
            <Button variant="secondary">Ver dashboard</Button>
          </Link>
          <Button onClick={abrirFormularioCreacion}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            Nueva actividad
          </Button>
        </div>
      </header>

      {errorProyecto && (
        <div className="mb-6">
          <MensajeError mensaje={errorProyecto} />
        </div>
      )}

      {errorAccion && (
        <div className="mb-6">
          <MensajeError mensaje={errorAccion} />
        </div>
      )}

      {cargandoEdicion && <EstadoDeCarga mensaje="Cargando actividad..." />}

      {cargando && <EstadoDeCarga mensaje="Cargando actividades..." />}
      {error && <MensajeError mensaje={error} />}
      {!cargando && !error && (
        <TablaActividades
          actividades={actividades}
          onEditar={(actividad) => void abrirFormularioEdicion(actividad)}
          onEliminar={(actividad) => setActividadAEliminar(actividad)}
          accionVacio={
            <Button variant="secondary" onClick={abrirFormularioCreacion}>
              Crear la primera actividad
            </Button>
          }
        />
      )}

      {modoFormulario && (
        <Modal titulo={tituloFormulario} onCerrar={cerrarFormulario}>
          <FormularioActividad
            valoresIniciales={
              modoFormulario.tipo === 'edicion'
                ? {
                    nombre: modoFormulario.actividad.nombre,
                    bac: modoFormulario.actividad.bac,
                    porcentajeAvancePlanificado: modoFormulario.actividad.porcentajeAvancePlanificado,
                    porcentajeAvanceReal: modoFormulario.actividad.porcentajeAvanceReal,
                    costoReal: modoFormulario.actividad.costoReal,
                  }
                : undefined
            }
            onGuardar={guardarActividad}
            onCancelar={cerrarFormulario}
          />
        </Modal>
      )}

      {actividadAEliminar && (
        <ConfirmDialog
          titulo="Eliminar actividad"
          descripcion={`¿Eliminar la actividad "${actividadAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          etiquetaConfirmar="Eliminar actividad"
          confirmando={eliminando}
          onConfirmar={() => void confirmarEliminacion()}
          onCancelar={() => setActividadAEliminar(null)}
        />
      )}

      {mensajeExito && <Toast mensaje={mensajeExito} onCerrar={() => setMensajeExito(null)} />}
    </main>
  );
}
