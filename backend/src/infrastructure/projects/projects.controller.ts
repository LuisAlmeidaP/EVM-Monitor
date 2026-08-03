import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ManageProjectsUseCase } from '../../application/projects/use-cases/manage-projects.use-case';
import { ErrorResponseDto } from '../filters/error-response.dto';
import { CreateProjectRequestDto } from './dto/create-project-request.dto';
import { UpdateProjectRequestDto } from './dto/update-project-request.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { DeleteProjectResponseDto } from './dto/delete-project-response.dto';

const PROYECTO_ID_PARAM = {
  name: 'proyectoId',
  description: 'Identificador único (UUID) del proyecto.',
  example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  format: 'uuid',
} as const;

@ApiTags('Proyectos')
@Controller('proyectos')
export class ProjectsController {
  constructor(private readonly manageProjectsUseCase: ManageProjectsUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un proyecto',
    description:
      'Crea un proyecto a partir de su nombre. El nombre es obligatorio y no puede quedar ' +
      'vacío ni compuesto solo por espacios en blanco.',
  })
  @ApiCreatedResponse({
    description: 'El proyecto fue creado correctamente.',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'El cuerpo de la petición no cumple la forma esperada (por ejemplo, falta "nombre" o no es un string).',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description:
      'El nombre está compuesto solo por espacios en blanco: "El nombre del proyecto no puede estar vacío."',
    type: ErrorResponseDto,
  })
  async create(
    @Body() body: CreateProjectRequestDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.manageProjectsUseCase.create(body.nombre);
    return ProjectResponseDto.fromDomain(project);
  }

  @Get()
  @ApiOperation({
    summary: 'Consultar proyectos',
    description: 'Devuelve la lista completa de proyectos registrados.',
  })
  @ApiOkResponse({
    description:
      'Lista de proyectos (puede ser vacía si no hay ninguno registrado).',
    type: [ProjectResponseDto],
  })
  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.manageProjectsUseCase.findAll();
    return projects.map((project) => ProjectResponseDto.fromDomain(project));
  }

  @Get(':proyectoId')
  @ApiOperation({
    summary: 'Consultar un proyecto por id',
    description: 'Devuelve un proyecto a partir de su identificador.',
  })
  @ApiParam(PROYECTO_ID_PARAM)
  @ApiOkResponse({
    description: 'Proyecto encontrado.',
    type: ProjectResponseDto,
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
  async findOne(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.manageProjectsUseCase.findById(proyectoId);
    return ProjectResponseDto.fromDomain(project);
  }

  @Put(':proyectoId')
  @ApiOperation({
    summary: 'Actualizar un proyecto',
    description: 'Actualiza el nombre de un proyecto existente.',
  })
  @ApiParam(PROYECTO_ID_PARAM)
  @ApiOkResponse({
    description: 'El proyecto fue actualizado correctamente.',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'El id no es un UUID válido, o el cuerpo de la petición no cumple la forma esperada.',
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
      'El nombre está compuesto solo por espacios en blanco: "El nombre del proyecto no puede estar vacío."',
    type: ErrorResponseDto,
  })
  async update(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
    @Body() body: UpdateProjectRequestDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.manageProjectsUseCase.update(
      proyectoId,
      body.nombre,
    );
    return ProjectResponseDto.fromDomain(project);
  }

  @Delete(':proyectoId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar un proyecto',
    description:
      'Elimina un proyecto por su id. No elimina en cascada sus actividades a nivel de base ' +
      'de datos (no existe una restricción de llave foránea entre actividades y proyectos, por ' +
      'diseño); las actividades asociadas quedarán huérfanas.',
  })
  @ApiParam(PROYECTO_ID_PARAM)
  @ApiOkResponse({
    description: 'El proyecto fue eliminado correctamente.',
    type: DeleteProjectResponseDto,
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
  async remove(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
  ): Promise<DeleteProjectResponseDto> {
    await this.manageProjectsUseCase.delete(proyectoId);
    return { mensaje: 'El proyecto fue eliminado correctamente.' };
  }
}
