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
import { AnalyzeActivityEvmUseCase } from '../../application/activities/use-cases/analyze-activity-evm.use-case';
import { ErrorResponseDto } from '../filters/error-response.dto';
import { ActivityEvmAnalysisResponseDto } from './dto/activity-evm-analysis-response.dto';

@ApiTags('Análisis EVM')
@Controller('actividades')
export class ActivityEvmAnalysisController {
  constructor(
    private readonly analyzeActivityEvmUseCase: AnalyzeActivityEvmUseCase,
  ) {}

  @Get(':actividadId/analisis-evm')
  @ApiOperation({
    summary: 'Análisis EVM de una actividad',
    description:
      'Calcula y devuelve los indicadores de Valor Ganado (EVM) de una actividad — PV, EV, ' +
      'AC, CV, SV, CPI, SPI, EAC, VAC —, su interpretación en lenguaje de negocio y su estado ' +
      'general. Todo el cálculo se delega íntegramente al dominio; el endpoint únicamente ' +
      'recupera la actividad y expone el resultado.',
  })
  @ApiParam({
    name: 'actividadId',
    description: 'Identificador único (UUID) de la actividad.',
    example: 'c1d2e3f4-5678-90ab-cdef-1234567890ab',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Análisis EVM calculado correctamente.',
    type: ActivityEvmAnalysisResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id proporcionado no es un UUID válido.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe una actividad con ese id.',
    type: ErrorResponseDto,
  })
  async analizarEvm(
    @Param('actividadId', ParseUUIDPipe) actividadId: string,
  ): Promise<ActivityEvmAnalysisResponseDto> {
    const { activity, analysis } =
      await this.analyzeActivityEvmUseCase.execute(actividadId);
    return ActivityEvmAnalysisResponseDto.fromDomain(activity, analysis);
  }
}
