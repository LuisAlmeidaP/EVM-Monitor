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
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ManageActivitiesUseCase } from '../../application/activities/use-cases/manage-activities.use-case';
import { ErrorResponseDto } from '../filters/error-response.dto';
import { UpdateActivityRequestDto } from './dto/update-activity-request.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { DeleteActivityResponseDto } from './dto/delete-activity-response.dto';

const ACTIVIDAD_ID_PARAM = {
  name: 'actividadId',
  description: 'Identificador único (UUID) de la actividad.',
  example: 'c1d2e3f4-5678-90ab-cdef-1234567890ab',
  format: 'uuid',
} as const;

@ApiTags('Actividades')
@Controller('actividades')
export class ActivitiesController {
  constructor(
    private readonly manageActivitiesUseCase: ManageActivitiesUseCase,
  ) {}

  @Get(':actividadId')
  @ApiOperation({
    summary: 'Consultar una actividad',
    description: 'Devuelve una actividad a partir de su identificador.',
  })
  @ApiParam(ACTIVIDAD_ID_PARAM)
  @ApiOkResponse({
    description: 'Actividad encontrada.',
    type: ActivityResponseDto,
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
  async findOne(
    @Param('actividadId', ParseUUIDPipe) actividadId: string,
  ): Promise<ActivityResponseDto> {
    const activity = await this.manageActivitiesUseCase.findById(actividadId);
    return ActivityResponseDto.fromDomain(activity);
  }

  @Put(':actividadId')
  @ApiOperation({
    summary: 'Actualizar una actividad',
    description:
      'Actualiza el nombre y los datos de avance de una actividad existente.',
  })
  @ApiParam(ACTIVIDAD_ID_PARAM)
  @ApiOkResponse({
    description: 'La actividad fue actualizada correctamente.',
    type: ActivityResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'El id no es un UUID válido, o el cuerpo de la petición no cumple la forma esperada.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No existe una actividad con ese id.',
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
  @ApiOperation({
    summary: 'Eliminar una actividad',
    description: 'Elimina una actividad por su id.',
  })
  @ApiParam(ACTIVIDAD_ID_PARAM)
  @ApiOkResponse({
    description: 'La actividad fue eliminada correctamente.',
    type: DeleteActivityResponseDto,
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
  async remove(
    @Param('actividadId', ParseUUIDPipe) actividadId: string,
  ): Promise<DeleteActivityResponseDto> {
    await this.manageActivitiesUseCase.delete(actividadId);
    return { mensaje: 'La actividad fue eliminada correctamente.' };
  }
}
