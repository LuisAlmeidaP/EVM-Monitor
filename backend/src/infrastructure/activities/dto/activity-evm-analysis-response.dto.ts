import { Activity } from '../../../domain/activities/activity';
import { EvmAnalysis } from '../../../domain/evm/evm-analysis';

class DatosAvanceDto {
  readonly bac: number;
  readonly porcentajeAvancePlanificado: number;
  readonly porcentajeAvanceReal: number;
  readonly costoReal: number;

  constructor(activity: Activity) {
    this.bac = activity.progressData.bac;
    this.porcentajeAvancePlanificado = activity.progressData.plannedPercentage;
    this.porcentajeAvanceReal = activity.progressData.actualPercentage;
    this.costoReal = activity.progressData.actualCost;
  }
}

class IndicadoresEvmDto {
  readonly pv: number;
  readonly ev: number;
  readonly cv: number;
  readonly sv: number;
  readonly cpi: number | null;
  readonly spi: number | null;
  readonly eac: number | null;
  readonly vac: number | null;

  constructor(analysis: EvmAnalysis) {
    this.pv = analysis.indicators.pv;
    this.ev = analysis.indicators.ev;
    this.cv = analysis.indicators.cv;
    this.sv = analysis.indicators.sv;
    this.cpi = analysis.indicators.cpi;
    this.spi = analysis.indicators.spi;
    this.eac = analysis.indicators.eac;
    this.vac = analysis.indicators.vac;
  }
}

class InterpretacionEvmDto {
  readonly estadoCosto: EvmAnalysis['interpretation']['costStatus'];
  readonly estadoCronograma: EvmAnalysis['interpretation']['scheduleStatus'];

  constructor(analysis: EvmAnalysis) {
    this.estadoCosto = analysis.interpretation.costStatus;
    this.estadoCronograma = analysis.interpretation.scheduleStatus;
  }
}

export class ActivityEvmAnalysisResponseDto {
  readonly actividadId: string;
  readonly proyectoId: string;
  readonly nombre: string;
  readonly datosAvance: DatosAvanceDto;
  readonly indicadores: IndicadoresEvmDto;
  readonly interpretacion: InterpretacionEvmDto;
  readonly estadoGeneral: EvmAnalysis['overallStatus'];

  private constructor(activity: Activity, analysis: EvmAnalysis) {
    this.actividadId = activity.id;
    this.proyectoId = activity.projectId;
    this.nombre = activity.name;
    this.datosAvance = new DatosAvanceDto(activity);
    this.indicadores = new IndicadoresEvmDto(analysis);
    this.interpretacion = new InterpretacionEvmDto(analysis);
    this.estadoGeneral = analysis.overallStatus;
  }

  static fromDomain(
    activity: Activity,
    analysis: EvmAnalysis,
  ): ActivityEvmAnalysisResponseDto {
    return new ActivityEvmAnalysisResponseDto(activity, analysis);
  }
}
