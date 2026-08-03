import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectEvmAnalysisResult } from '../../../application/projects/use-cases/analyze-project-evm.use-case';
import { EvmAnalysis } from '../../../domain/evm/evm-analysis';
import {
  IndicadoresEvmDto,
  InterpretacionEvmDto,
} from '../../activities/dto/activity-evm-analysis-response.dto';

const ESTADO_GENERAL_VALUES = ['saludable', 'en_riesgo', 'critico'] as const;

export class ProjectEvmAnalysisResponseDto {
  @ApiProperty({
    description: 'Identificador único del proyecto analizado.',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
  })
  readonly proyectoId: string;

  @ApiProperty({
    description:
      'Cantidad de actividades del proyecto incluidas en el consolidado.',
    example: 2,
    minimum: 1,
  })
  readonly cantidadActividades: number;

  @ApiProperty({
    description:
      'Indicadores EVM consolidados: la suma de los valores base (BAC, PV, EV, AC) de todas ' +
      'las actividades del proyecto, con los ratios (CPI, SPI, EAC, VAC) recalculados sobre esos ' +
      'totales (método de consolidación estándar del PMI).',
    type: () => IndicadoresEvmDto,
  })
  readonly indicadores: IndicadoresEvmDto;

  @ApiProperty({
    description:
      'Interpretación en lenguaje de negocio de los indicadores consolidados.',
    type: () => InterpretacionEvmDto,
  })
  readonly interpretacion: InterpretacionEvmDto;

  @ApiPropertyOptional({
    description:
      'Estado general del proyecto, combinando el desempeño de costo y de cronograma ' +
      'consolidados. Es null cuando CPI o SPI son indeterminados.',
    enum: ESTADO_GENERAL_VALUES,
    example: 'en_riesgo',
    nullable: true,
  })
  readonly estadoGeneral: EvmAnalysis['overallStatus'];

  private constructor(result: ProjectEvmAnalysisResult) {
    this.proyectoId = result.projectId;
    this.cantidadActividades = result.activityCount;
    this.indicadores = new IndicadoresEvmDto(result.analysis);
    this.interpretacion = new InterpretacionEvmDto(result.analysis);
    this.estadoGeneral = result.analysis.overallStatus;
  }

  static fromResult(
    result: ProjectEvmAnalysisResult,
  ): ProjectEvmAnalysisResponseDto {
    return new ProjectEvmAnalysisResponseDto(result);
  }
}
