import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { AnalyzeActivityEvmUseCase } from '../../application/activities/use-cases/analyze-activity-evm.use-case';
import { ManageActivitiesUseCase } from '../../application/activities/use-cases/manage-activities.use-case';
import { UpdateActivityRequestDto } from './dto/update-activity-request.dto';
import { ActivityEvmAnalysisResponseDto } from './dto/activity-evm-analysis-response.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';

interface DeleteActivityResponse {
  readonly mensaje: string;
}

@Controller('actividades')
export class ActivitiesController {
  constructor(
    private readonly manageActivitiesUseCase: ManageActivitiesUseCase,
    private readonly analyzeActivityEvmUseCase: AnalyzeActivityEvmUseCase,
  ) {}

  @Get(':actividadId')
  async findOne(
    @Param('actividadId', ParseUUIDPipe) actividadId: string,
  ): Promise<ActivityResponseDto> {
    const activity = await this.manageActivitiesUseCase.findById(actividadId);
    return ActivityResponseDto.fromDomain(activity);
  }

  @Get(':actividadId/analisis-evm')
  async analizarEvm(
    @Param('actividadId', ParseUUIDPipe) actividadId: string,
  ): Promise<ActivityEvmAnalysisResponseDto> {
    const { activity, analysis } =
      await this.analyzeActivityEvmUseCase.execute(actividadId);
    return ActivityEvmAnalysisResponseDto.fromDomain(activity, analysis);
  }

  @Put(':actividadId')
  async update(
    @Param('actividadId', ParseUUIDPipe) actividadId: string,
    @Body() body: UpdateActivityRequestDto,
  ): Promise<ActivityResponseDto> {
    const activity = await this.manageActivitiesUseCase.update(
      actividadId,
      body.nombre,
      {
        bac: body.bac,
        plannedPercentage: body.porcentajeAvancePlanificado,
        actualPercentage: body.porcentajeAvanceReal,
        actualCost: body.costoReal,
      },
    );
    return ActivityResponseDto.fromDomain(activity);
  }

  @Delete(':actividadId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('actividadId', ParseUUIDPipe) actividadId: string,
  ): Promise<DeleteActivityResponse> {
    await this.manageActivitiesUseCase.delete(actividadId);
    return { mensaje: 'La actividad fue eliminada correctamente.' };
  }
}
