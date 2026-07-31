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
import { ManageActivitiesUseCase } from '../../application/activities/use-cases/manage-activities.use-case';
import { UpdateActivityRequestDto } from './dto/update-activity-request.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';

interface DeleteActivityResponse {
  readonly mensaje: string;
}

@Controller('actividades')
export class ActivitiesController {
  constructor(
    private readonly manageActivitiesUseCase: ManageActivitiesUseCase,
  ) {}

  @Get(':actividadId')
  async findOne(
    @Param('actividadId', ParseUUIDPipe) actividadId: string,
  ): Promise<ActivityResponseDto> {
    const activity = await this.manageActivitiesUseCase.findById(actividadId);
    return ActivityResponseDto.fromDomain(activity);
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
