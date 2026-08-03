import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AnalyzeProjectEvmUseCase } from '../../application/projects/use-cases/analyze-project-evm.use-case';
import { ErrorResponseDto } from '../filters/error-response.dto';
import { ProjectEvmAnalysisResponseDto } from './dto/project-evm-analysis-response.dto';

@ApiTags('Análisis EVM')
@Controller('proyectos')
export class ProjectEvmAnalysisController {
  constructor(
    private readonly analyzeProjectEvmUseCase: AnalyzeProjectEvmUseCase,
  ) {}

  @Get(':proyectoId/analisis-evm')
  @ApiOperation({
    summary: 'Análisis EVM consolidado de un proyecto',
    description:
      'Calcula el análisis EVM consolidado de un proyecto: suma los valores base (BAC, PV, ' +
      'EV, AC) de todas sus actividades y recalcula los ratios (CPI, SPI, EAC, VAC) sobre esos ' +
      'totales (método de consolidación estándar del PMI), junto con su interpretación y ' +
      'estado general.',
  })
  @ApiParam({
    name: 'proyectoId',
    description: 'Identificador único (UUID) del proyecto.',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Análisis consolidado calculado correctamente.',
    type: ProjectEvmAnalysisResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un UUID válido.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe un proyecto con ese id.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description:
      'El proyecto no tiene actividades registradas: "No es posible calcular el análisis ' +
      'consolidado de un proyecto sin actividades registradas."',
    type: ErrorResponseDto,
  })
  async analizarEvm(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
  ): Promise<ProjectEvmAnalysisResponseDto> {
    const result = await this.analyzeProjectEvmUseCase.execute(proyectoId);
    return ProjectEvmAnalysisResponseDto.fromResult(result);
  }
}
