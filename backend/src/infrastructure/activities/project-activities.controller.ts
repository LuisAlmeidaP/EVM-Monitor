import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ManageActivitiesUseCase } from '../../application/activities/use-cases/manage-activities.use-case';
import { CreateActivityRequestDto } from './dto/create-activity-request.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';

@Controller('proyectos/:proyectoId/actividades')
export class ProjectActivitiesController {
  constructor(
    private readonly manageActivitiesUseCase: ManageActivitiesUseCase,
  ) {}

  @Post()
  async create(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
    @Body() body: CreateActivityRequestDto,
  ): Promise<ActivityResponseDto> {
    const activity = await this.manageActivitiesUseCase.create(
      proyectoId,
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

  @Get()
  async findAll(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
  ): Promise<ActivityResponseDto[]> {
    const activities =
      await this.manageActivitiesUseCase.findAllByProject(proyectoId);
    return activities.map((activity) =>
      ActivityResponseDto.fromDomain(activity),
    );
  }
}
