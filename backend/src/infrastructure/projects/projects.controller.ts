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
import { ManageProjectsUseCase } from '../../application/projects/use-cases/manage-projects.use-case';
import { CreateProjectRequestDto } from './dto/create-project-request.dto';
import { UpdateProjectRequestDto } from './dto/update-project-request.dto';
import { ProjectResponseDto } from './dto/project-response.dto';

interface DeleteProjectResponse {
  readonly mensaje: string;
}

@Controller('proyectos')
export class ProjectsController {
  constructor(private readonly manageProjectsUseCase: ManageProjectsUseCase) {}

  @Post()
  async create(
    @Body() body: CreateProjectRequestDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.manageProjectsUseCase.create(body.nombre);
    return ProjectResponseDto.fromDomain(project);
  }

  @Get()
  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.manageProjectsUseCase.findAll();
    return projects.map((project) => ProjectResponseDto.fromDomain(project));
  }

  @Get(':proyectoId')
  async findOne(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.manageProjectsUseCase.findById(proyectoId);
    return ProjectResponseDto.fromDomain(project);
  }

  @Put(':proyectoId')
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
  async remove(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
  ): Promise<DeleteProjectResponse> {
    await this.manageProjectsUseCase.delete(proyectoId);
    return { mensaje: 'El proyecto fue eliminado correctamente.' };
  }
}
