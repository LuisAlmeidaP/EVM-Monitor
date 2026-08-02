import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MensajeError } from '../../components/MensajeError/MensajeError';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { IndicadorEnProgreso } from '../../components/ui/IndicadorEnProgreso';
import { FormularioActividad } from '../../components/FormularioActividad/FormularioActividad';
import { ResumenEjecutivo } from '../../components/ResumenEjecutivo/ResumenEjecutivo';
import { AlertaDesviacion } from '../../components/AlertaDesviacion/AlertaDesviacion';
import { IndicadorEvm } from '../../components/IndicadorEvm/IndicadorEvm';
import { InterpretacionEvm } from '../../components/InterpretacionEvm/InterpretacionEvm';
import { GraficoValorEvm } from '../../components/GraficoValorEvm/GraficoValorEvm';
import { GaugeIndiceEvm } from '../../components/GaugeIndiceEvm/GaugeIndiceEvm';
import { GraficoComparativoIndices } from '../../components/GraficoComparativoIndices/GraficoComparativoIndices';
import { GraficoDistribucionPresupuesto } from '../../components/GraficoDistribucionPresupuesto/GraficoDistribucionPresupuesto';
import { TablaActividades } from '../../components/TablaActividades/TablaActividades';
import { actividadesApi } from '../../api/actividadesApi';
import { obtenerMensajeDeError } from '../../api/apiError';
import { formatearIndice, formatearNumero } from '../../utils/format';
import { tonoPorIndice, tonoPorVariacion } from '../../utils/estadoColores';
import { useDashboardProyecto } from './useDashboardProyecto';
import { DashboardSkeleton } from './DashboardSkeleton';
import type { Actividad, ActividadInput } from '../../types/actividad';

type ModoFormulario = { tipo: 'creacion' } | { tipo: 'edicion'; actividad: Actividad };

export function DashboardProyecto() {
  const { proyectoId } = useParams<{ proyectoId: string }>();
  const {
    proyecto,
    analisis,
    actividades,
    cargando,
    actualizando,
    error,
    crearActividad,
    editarActividad,
    eliminarActividad,
  } = useDashboardProyecto(proyectoId ?? '');

  const [modoFormulario, setModoFormulario] = useState<ModoFormulario | null>(null);
  const [actividadAEliminar, setActividadAEliminar] = useState<Actividad | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  if (!proyectoId) {
    return <MensajeError mensaje="No se especificó un proyecto válido." />;
  }

  const urlActividades = `/proyectos/${proyectoId}/actividades`;
  const bacTotal = actividades.reduce((total, actividad) => total + actividad.bac, 0);
  const acTotal = actividades.reduce((total, actividad) => total + actividad.costoReal, 0);

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
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link to="/" className="text-sm text-apagado hover:text-acento">
        ← Volver a proyectos
      </Link>

      {cargando && (
        <div className="mt-6">
          <DashboardSkeleton />
        </div>
      )}
      {error && (
        <div className="mt-4">
          <MensajeError mensaje={error} />
        </div>
      )}
      {errorAccion && (
        <div className="mt-4">
          <MensajeError mensaje={errorAccion} />
        </div>
      )}

      {!cargando && !error && (
        <>
          <header className="mt-3 mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl text-tinta">
                  {proyecto?.nombre ?? 'Dashboard del proyecto'}
                </h1>
                {actualizando && <IndicadorEnProgreso mensaje="Actualizando…" />}
              </div>
              <p className="mt-1.5 text-sm text-apagado">
                Dashboard ejecutivo — análisis de Valor Ganado (EVM) consolidado del proyecto.
              </p>
            </div>
            <Link to={urlActividades}>
              <Button variant="secondary">Gestionar actividades</Button>
            </Link>
          </header>

          {cargandoEdicion && (
            <div className="mb-4">
              <IndicadorEnProgreso mensaje="Cargando actividad…" />
            </div>
          )}

          {actividades.length === 0 && (
            <EmptyState
              titulo="Este proyecto no tiene actividades registradas todavía."
              descripcion="Registre al menos una actividad para poder calcular su análisis EVM consolidado."
              accion={<Button onClick={abrirFormularioCreacion}>Crear la primera actividad</Button>}
            />
          )}

          {actividades.length > 0 && analisis && (
            <>
              <div className="mb-6">
                <ResumenEjecutivo
                  estadoGeneral={analisis.estadoGeneral}
                  interpretacion={analisis.interpretacion}
                  cantidadActividades={analisis.cantidadActividades}
                />
              </div>

              <div className="mb-6">
                <AlertaDesviacion
                  cv={analisis.indicadores.cv}
                  sv={analisis.indicadores.sv}
                  estadoCosto={analisis.interpretacion.estadoCosto}
                  estadoCronograma={analisis.interpretacion.estadoCronograma}
                />
              </div>

              <section
                aria-label="Indicadores EVM consolidados"
                className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
              >
                <IndicadorEvm
                  etiqueta="BAC"
                  valor={formatearNumero(bacTotal)}
                  descripcion="Presupuesto total planeado del proyecto"
                />
                <IndicadorEvm
                  etiqueta="PV"
                  valor={formatearNumero(analisis.indicadores.pv)}
                  descripcion="Valor que se esperaba tener a la fecha"
                />
                <IndicadorEvm
                  etiqueta="EV"
                  valor={formatearNumero(analisis.indicadores.ev)}
                  descripcion="Valor realmente ganado según el avance"
                />
                <IndicadorEvm
                  etiqueta="AC"
                  valor={formatearNumero(acTotal)}
                  descripcion="Costo realmente incurrido en el proyecto"
                />
                <IndicadorEvm
                  etiqueta="CV"
                  valor={formatearNumero(analisis.indicadores.cv)}
                  descripcion="Diferencia entre lo ganado y lo gastado"
                  tono={tonoPorVariacion(analisis.indicadores.cv)}
                />
                <IndicadorEvm
                  etiqueta="SV"
                  valor={formatearNumero(analisis.indicadores.sv)}
                  descripcion="Diferencia entre lo ganado y lo planeado"
                  tono={tonoPorVariacion(analisis.indicadores.sv)}
                />
                <IndicadorEvm
                  etiqueta="CPI"
                  valor={formatearIndice(analisis.indicadores.cpi)}
                  descripcion="Eficiencia del costo (1.00 = en presupuesto)"
                  tono={tonoPorIndice(analisis.indicadores.cpi)}
                />
                <IndicadorEvm
                  etiqueta="SPI"
                  valor={formatearIndice(analisis.indicadores.spi)}
                  descripcion="Eficiencia del cronograma (1.00 = a tiempo)"
                  tono={tonoPorIndice(analisis.indicadores.spi)}
                />
              </section>

              <section
                aria-label="Proyección al finalizar"
                className="mb-8 grid grid-cols-2 gap-3 sm:max-w-md"
              >
                <IndicadorEvm
                  etiqueta="EAC"
                  valor={
                    analisis.indicadores.eac === null ? 'N/D' : formatearNumero(analisis.indicadores.eac)
                  }
                  descripcion="Costo estimado al finalizar el proyecto"
                />
                <IndicadorEvm
                  etiqueta="VAC"
                  valor={
                    analisis.indicadores.vac === null ? 'N/D' : formatearNumero(analisis.indicadores.vac)
                  }
                  descripcion="Variación estimada al finalizar el proyecto"
                  tono={
                    analisis.indicadores.vac === null ? 'neutral' : tonoPorVariacion(analisis.indicadores.vac)
                  }
                />
              </section>

              <section aria-label="Gráficos EVM del proyecto" className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-borde bg-superficie p-5 shadow-sm">
                  <p className="mb-2 font-display text-lg text-tinta">Valor planificado, ganado y real</p>
                  <p className="mb-2 text-xs text-apagado">
                    Compara, a nivel de todo el proyecto, cuánto se planeó, cuánto se ha ganado por avance y
                    cuánto se ha gastado, contra el presupuesto total.
                  </p>
                  <GraficoValorEvm
                    pv={analisis.indicadores.pv}
                    ev={analisis.indicadores.ev}
                    ac={acTotal}
                    bac={bacTotal}
                    estadoCosto={analisis.interpretacion.estadoCosto}
                    estadoCronograma={analisis.interpretacion.estadoCronograma}
                  />
                </div>

                <div className="rounded-2xl border border-borde bg-superficie p-5 shadow-sm">
                  <p className="mb-2 font-display text-lg text-tinta">Índices de desempeño</p>
                  <p className="mb-3 text-xs text-apagado">
                    CPI y SPI consolidados, comparados contra la meta de 1.00.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <GaugeIndiceEvm
                      etiqueta="CPI"
                      descripcion="Eficiencia de costo"
                      valor={analisis.indicadores.cpi}
                    />
                    <GaugeIndiceEvm
                      etiqueta="SPI"
                      descripcion="Eficiencia de cronograma"
                      valor={analisis.indicadores.spi}
                    />
                  </div>
                  <div className="mt-4">
                    <GraficoComparativoIndices cpi={analisis.indicadores.cpi} spi={analisis.indicadores.spi} />
                  </div>
                </div>

                <div className="rounded-2xl border border-borde bg-superficie p-5 shadow-sm lg:col-span-2">
                  <p className="mb-2 font-display text-lg text-tinta">Distribución del presupuesto</p>
                  <p className="mb-3 text-xs text-apagado">
                    Proporción del presupuesto total ya gastada frente a lo disponible.
                  </p>
                  <div className="mx-auto max-w-xs">
                    <GraficoDistribucionPresupuesto bacTotal={bacTotal} acTotal={acTotal} />
                  </div>
                </div>
              </section>

              <section aria-label="Interpretación" className="mb-8">
                <InterpretacionEvm interpretacion={analisis.interpretacion} />
              </section>
            </>
          )}

          {actividades.length > 0 && (
            <section aria-label="Actividades del proyecto">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-lg text-tinta">Actividades del proyecto</p>
                <Button onClick={abrirFormularioCreacion}>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
                    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                  </svg>
                  Nueva actividad
                </Button>
              </div>
              <TablaActividades
                actividades={actividades}
                onEditar={(actividad) => void abrirFormularioEdicion(actividad)}
                onEliminar={(actividad) => setActividadAEliminar(actividad)}
              />
            </section>
          )}
        </>
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
