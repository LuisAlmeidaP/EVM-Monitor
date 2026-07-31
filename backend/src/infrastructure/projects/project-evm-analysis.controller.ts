import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { AnalyzeProjectEvmUseCase } from '../../application/projects/use-cases/analyze-project-evm.use-case';
import { ProjectEvmAnalysisResponseDto } from './dto/project-evm-analysis-response.dto';

@Controller('proyectos')
export class ProjectEvmAnalysisController {
  constructor(
    private readonly analyzeProjectEvmUseCase: AnalyzeProjectEvmUseCase,
  ) {}

  @Get(':proyectoId/analisis-evm')
  async analizarEvm(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
  ): Promise<ProjectEvmAnalysisResponseDto> {
    const result = await this.analyzeProjectEvmUseCase.execute(proyectoId);
    return ProjectEvmAnalysisResponseDto.fromResult(result);
  }
}
