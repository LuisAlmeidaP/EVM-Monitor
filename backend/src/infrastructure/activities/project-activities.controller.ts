import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ManageActivitiesUseCase } from '../../application/activities/use-cases/manage-activities.use-case';
import { ErrorResponseDto } from '../filters/error-response.dto';
import { CreateActivityRequestDto } from './dto/create-activity-request.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';

const PROYECTO_ID_PARAM = {
  name: 'proyectoId',
  description:
    'Identificador único (UUID) del proyecto dueño de las actividades.',
  example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  format: 'uuid',
} as const;

@ApiTags('Actividades')
@Controller('proyectos/:proyectoId/actividades')
export class ProjectActivitiesController {
  constructor(
    private readonly manageActivitiesUseCase: ManageActivitiesUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una actividad',
    description:
      'Crea una actividad dentro de un proyecto existente. El proyecto y la actividad se ' +
      'relacionan a nivel de aplicación (no existe una llave foránea en base de datos, por ' +
      'diseño: así una eliminación de proyecto nunca falla por una restricción inesperada).',
  })
  @ApiParam(PROYECTO_ID_PARAM)
  @ApiCreatedResponse({
    description: 'La actividad fue creada correctamente.',
    type: ActivityResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'El id del proyecto no es un UUID válido, o el cuerpo de la petición no cumple la forma esperada.',
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
      'El nombre está compuesto solo por espacios en blanco, o alguno de los datos de avance ' +
      'incumple una regla de negocio (BAC/costo real negativos, porcentajes fuera de 0-100). ' +
      'Puede incluir varios mensajes a la vez en "detalles".',
    type: ErrorResponseDto,
  })
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
  @ApiOperation({
    summary: 'Consultar actividades de un proyecto',
    description: 'Devuelve todas las actividades pertenecientes a un proyecto.',
  })
  @ApiParam(PROYECTO_ID_PARAM)
  @ApiOkResponse({
    description:
      'Lista de actividades del proyecto (puede ser vacía si no tiene ninguna).',
    type: [ActivityResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'El id del proyecto no es un UUID válido.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe un proyecto con ese id.',
    type: ErrorResponseDto,
  })
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
