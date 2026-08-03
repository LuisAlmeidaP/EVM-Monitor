import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Activity } from '../../../domain/activities/activity';
import { EvmAnalysis } from '../../../domain/evm/evm-analysis';

const ESTADO_COSTO_VALUES = [
  'bajo_presupuesto',
  'sobre_presupuesto',
  'en_presupuesto',
] as const;
const ESTADO_CRONOGRAMA_VALUES = [
  'adelantado',
  'atrasado',
  'a_tiempo',
] as const;
const ESTADO_GENERAL_VALUES = ['saludable', 'en_riesgo', 'critico'] as const;

class DatosAvanceDto {
  @ApiProperty({
    description: 'Presupuesto planificado (Budget At Completion).',
    example: 100_000,
  })
  readonly bac: number;

  @ApiProperty({
    description: 'Porcentaje de avance planificado a la fecha (0-100).',
    example: 50,
  })
  readonly porcentajeAvancePlanificado: number;

  @ApiProperty({
    description: 'Porcentaje de avance real ejecutado a la fecha (0-100).',
    example: 40,
  })
  readonly porcentajeAvanceReal: number;

  @ApiProperty({
    description: 'Costo real incurrido (Actual Cost).',
    example: 50_000,
  })
  readonly costoReal: number;

  constructor(activity: Activity) {
    this.bac = activity.progressData.bac;
    this.porcentajeAvancePlanificado = activity.progressData.plannedPercentage;
    this.porcentajeAvanceReal = activity.progressData.actualPercentage;
    this.costoReal = activity.progressData.actualCost;
  }
}

export class IndicadoresEvmDto {
  @ApiProperty({
    description: 'Valor planificado (Planned Value) a la fecha.',
    example: 50_000,
  })
  readonly pv: number;

  @ApiProperty({
    description: 'Valor ganado (Earned Value) según el avance real.',
    example: 40_000,
  })
  readonly ev: number;

  @ApiProperty({
    description: 'Variación de costo (Cost Variance = EV - AC).',
    example: -10_000,
  })
  readonly cv: number;

  @ApiProperty({
    description: 'Variación de cronograma (Schedule Variance = EV - PV).',
    example: -10_000,
  })
  readonly sv: number;

  @ApiPropertyOptional({
    description:
      'Índice de desempeño de costo (Cost Performance Index = EV / AC). Es null cuando el ' +
      'costo real (AC) es cero, ya que el índice es matemáticamente indeterminado.',
    example: 0.8,
    nullable: true,
  })
  readonly cpi: number | null;

  @ApiPropertyOptional({
    description:
      'Índice de desempeño de cronograma (Schedule Performance Index = EV / PV). Es null ' +
      'cuando el valor planificado (PV) es cero, ya que el índice es matemáticamente indeterminado.',
    example: 0.8,
    nullable: true,
  })
  readonly spi: number | null;

  @ApiPropertyOptional({
    description:
      'Estimación al finalizar (Estimate At Completion = BAC / CPI). Es null cuando CPI es ' +
      'null o cero.',
    example: 125_000,
    nullable: true,
  })
  readonly eac: number | null;

  @ApiPropertyOptional({
    description:
      'Variación al finalizar (Variance At Completion = BAC - EAC). Es null cuando EAC es null.',
    example: -25_000,
    nullable: true,
  })
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

export class InterpretacionEvmDto {
  @ApiPropertyOptional({
    description:
      'Interpretación del desempeño de costo, derivada de CPI. Es null cuando CPI es null.',
    enum: ESTADO_COSTO_VALUES,
    example: 'sobre_presupuesto',
    nullable: true,
  })
  readonly estadoCosto: EvmAnalysis['interpretation']['costStatus'];

  @ApiPropertyOptional({
    description:
      'Interpretación del desempeño de cronograma, derivada de SPI. Es null cuando SPI es null.',
    enum: ESTADO_CRONOGRAMA_VALUES,
    example: 'atrasado',
    nullable: true,
  })
  readonly estadoCronograma: EvmAnalysis['interpretation']['scheduleStatus'];

  constructor(analysis: EvmAnalysis) {
    this.estadoCosto = analysis.interpretation.costStatus;
    this.estadoCronograma = analysis.interpretation.scheduleStatus;
  }
}

export class ActivityEvmAnalysisResponseDto {
  @ApiProperty({
    description: 'Identificador único de la actividad analizada.',
    example: 'c1d2e3f4-5678-90ab-cdef-1234567890ab',
    format: 'uuid',
  })
  readonly actividadId: string;

  @ApiProperty({
    description: 'Identificador del proyecto al que pertenece la actividad.',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
  })
  readonly proyectoId: string;

  @ApiProperty({
    description: 'Nombre de la actividad.',
    example: 'Excavación',
  })
  readonly nombre: string;

  @ApiProperty({
    description: 'Datos de avance registrados para la actividad.',
    type: () => DatosAvanceDto,
  })
  readonly datosAvance: DatosAvanceDto;

  @ApiProperty({
    description: 'Indicadores EVM calculados para la actividad.',
    type: () => IndicadoresEvmDto,
  })
  readonly indicadores: IndicadoresEvmDto;

  @ApiProperty({
    description:
      'Interpretación en lenguaje de negocio de los indicadores calculados.',
    type: () => InterpretacionEvmDto,
  })
  readonly interpretacion: InterpretacionEvmDto;

  @ApiPropertyOptional({
    description:
      'Estado general de la actividad, combinando el desempeño de costo y de cronograma. Es ' +
      'null cuando CPI o SPI son indeterminados.',
    enum: ESTADO_GENERAL_VALUES,
    example: 'en_riesgo',
    nullable: true,
  })
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
