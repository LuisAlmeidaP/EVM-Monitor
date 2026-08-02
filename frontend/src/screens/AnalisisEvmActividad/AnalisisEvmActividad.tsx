import { useNavigate, useParams } from 'react-router-dom';
import { EstadoDeCarga } from '../../components/EstadoDeCarga/EstadoDeCarga';
import { MensajeError } from '../../components/MensajeError/MensajeError';
import { EstadoGeneralBadge } from '../../components/EstadoGeneralBadge/EstadoGeneralBadge';
import { IndicadorEvm } from '../../components/IndicadorEvm/IndicadorEvm';
import { InterpretacionEvm } from '../../components/InterpretacionEvm/InterpretacionEvm';
import { AlertaDesviacion } from '../../components/AlertaDesviacion/AlertaDesviacion';
import { GraficoValorEvm } from '../../components/GraficoValorEvm/GraficoValorEvm';
import { GaugeIndiceEvm } from '../../components/GaugeIndiceEvm/GaugeIndiceEvm';
import { GraficoComparativoIndices } from '../../components/GraficoComparativoIndices/GraficoComparativoIndices';
import { formatearIndice, formatearNumero } from '../../utils/format';
import { tonoPorIndice, tonoPorVariacion } from '../../utils/estadoColores';
import { useAnalisisEvm } from './useAnalisisEvm';

export function AnalisisEvmActividad() {
  const { actividadId } = useParams<{ actividadId: string }>();
  const navigate = useNavigate();
  const { analisis, cargando, error } = useAnalisisEvm(actividadId ?? '');

  if (!actividadId) {
    return <MensajeError mensaje="No se especificó una actividad válida." />;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-apagado hover:text-acento"
      >
        ← Volver a actividades
      </button>

      {cargando && <EstadoDeCarga mensaje="Cargando análisis EVM..." />}
      {error && (
        <div className="mt-4">
          <MensajeError mensaje={error} />
        </div>
      )}

      {!cargando && !error && analisis && (
        <>
          <header className="mt-3 mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-3xl text-tinta">{analisis.nombre}</h1>
              <p className="mt-1.5 text-sm text-apagado">
                Análisis de Valor Ganado (EVM) de la actividad.
              </p>
            </div>
            <EstadoGeneralBadge estado={analisis.estadoGeneral} />
          </header>

          <div className="mb-6">
            <AlertaDesviacion
              cv={analisis.indicadores.cv}
              sv={analisis.indicadores.sv}
              estadoCosto={analisis.interpretacion.estadoCosto}
              estadoCronograma={analisis.interpretacion.estadoCronograma}
            />
          </div>

          <section aria-label="Indicadores EVM" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <IndicadorEvm
              etiqueta="BAC"
              valor={formatearNumero(analisis.datosAvance.bac)}
              descripcion="Presupuesto total planeado"
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
              valor={formatearNumero(analisis.datosAvance.costoReal)}
              descripcion="Costo realmente incurrido"
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

          <section aria-label="Proyección al finalizar" className="mb-8 grid grid-cols-2 gap-3 sm:max-w-md">
            <IndicadorEvm
              etiqueta="EAC"
              valor={analisis.indicadores.eac === null ? 'N/D' : formatearNumero(analisis.indicadores.eac)}
              descripcion="Costo estimado al finalizar"
            />
            <IndicadorEvm
              etiqueta="VAC"
              valor={analisis.indicadores.vac === null ? 'N/D' : formatearNumero(analisis.indicadores.vac)}
              descripcion="Variación estimada al finalizar"
              tono={analisis.indicadores.vac === null ? 'neutral' : tonoPorVariacion(analisis.indicadores.vac)}
            />
          </section>

          <section aria-label="Gráficos EVM" className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-borde bg-superficie p-5 shadow-sm">
              <p className="mb-2 font-display text-lg text-tinta">Valor planificado, ganado y real</p>
              <p className="mb-2 text-xs text-apagado">
                Compara cuánto se planeó, cuánto se ha ganado por avance y cuánto se ha gastado, contra el
                presupuesto total.
              </p>
              <GraficoValorEvm
                pv={analisis.indicadores.pv}
                ev={analisis.indicadores.ev}
                ac={analisis.datosAvance.costoReal}
                bac={analisis.datosAvance.bac}
                estadoCosto={analisis.interpretacion.estadoCosto}
                estadoCronograma={analisis.interpretacion.estadoCronograma}
              />
            </div>

            <div className="rounded-2xl border border-borde bg-superficie p-5 shadow-sm">
              <p className="mb-2 font-display text-lg text-tinta">Índices de desempeño</p>
              <p className="mb-3 text-xs text-apagado">
                CPI y SPI comparados contra la meta de 1.00. Por debajo de la meta indica sobrecosto o
                retraso.
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
          </section>

          <section aria-label="Interpretación">
            <InterpretacionEvm interpretacion={analisis.interpretacion} />
          </section>
        </>
      )}
    </main>
  );
}
