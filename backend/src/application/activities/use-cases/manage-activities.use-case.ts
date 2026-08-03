import { Inject, Injectable } from '@nestjs/common';
import { Activity } from '../../../domain/activities/activity';
import type { ActivityProgressDataInput } from '../../../domain/evm/activity-progress-data';
import { ResourceNotFoundException } from '../../exceptions/resource-not-found.exception';
import { ACTIVITY_REPOSITORY } from '../ports/activity-repository.port';
import type { ActivityRepositoryPort } from '../ports/activity-repository.port';
import { PROJECT_REPOSITORY } from '../../projects/ports/project-repository.port';
import type { ProjectRepositoryPort } from '../../projects/ports/project-repository.port';

@Injectable()
export class ManageActivitiesUseCase {
  constructor(
    @Inject(ACTIVITY_REPOSITORY)
    private readonly activityRepository: ActivityRepositoryPort,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepositoryPort,
  ) {}

  async create(
    projectId: string,
    name: string,
    progressInput: ActivityProgressDataInput,
  ): Promise<Activity> {
    await this.ensureProjectExists(projectId);
    const activity = Activity.create(projectId, name, progressInput);
    return this.activityRepository.save(activity);
  }

  async findAllByProject(projectId: string): Promise<Activity[]> {
    await this.ensureProjectExists(projectId);
    return this.activityRepository.findAllByProject(projectId);
  }

  async findById(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findById(id);

    if (!activity) {
      throw new ResourceNotFoundException(
        `No se encontró una actividad con el identificador "${id}".`,
      );
    }

    return activity;
  }

  async update(
    id: string,
    name: string,
    progressInput: ActivityProgressDataInput,
  ): Promise<Activity> {
    const activity = await this.findById(id);
    activity.update(name, progressInput);
    return this.activityRepository.save(activity);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.activityRepository.delete(id);
  }

  private async ensureProjectExists(projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new ResourceNotFoundException(
        `No se encontró un proyecto con el identificador "${projectId}".`,
      );
    }
  }
}
