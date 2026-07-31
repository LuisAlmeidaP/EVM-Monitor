import { ProjectEvmAnalysisResult } from '../../../application/projects/use-cases/analyze-project-evm.use-case';
import { EvmAnalysis } from '../../../domain/evm/evm-analysis';
import {
  IndicadoresEvmDto,
  InterpretacionEvmDto,
} from '../../activities/dto/activity-evm-analysis-response.dto';

export class ProjectEvmAnalysisResponseDto {
  readonly proyectoId: string;
  readonly cantidadActividades: number;
  readonly indicadores: IndicadoresEvmDto;
  readonly interpretacion: InterpretacionEvmDto;
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
