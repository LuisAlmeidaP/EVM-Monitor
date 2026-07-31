import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Activity } from '../../domain/activities/activity';
import type { ActivityRepositoryPort } from '../../application/activities/ports/activity-repository.port';
import { ActivityOrmEntity } from './entities/activity.orm-entity';

@Injectable()
export class ActivityRepository implements ActivityRepositoryPort {
  constructor(
    @InjectRepository(ActivityOrmEntity)
    private readonly repository: Repository<ActivityOrmEntity>,
  ) {}

  async save(activity: Activity): Promise<Activity> {
    const saved = await this.repository.save(this.toOrmEntity(activity));
    return this.toDomain(saved);
  }

  async findAllByProject(projectId: string): Promise<Activity[]> {
    const entities = await this.repository.findBy({ projectId });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string): Promise<Activity | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: ActivityOrmEntity): Activity {
    return Activity.reconstitute(entity.id, entity.projectId, entity.name, {
      bac: entity.bac,
      plannedPercentage: entity.plannedPercentage,
      actualPercentage: entity.actualPercentage,
      actualCost: entity.actualCost,
    });
  }

  private toOrmEntity(activity: Activity): ActivityOrmEntity {
    const ormEntity = new ActivityOrmEntity();
    ormEntity.id = activity.id;
    ormEntity.projectId = activity.projectId;
    ormEntity.name = activity.name;
    ormEntity.bac = activity.progressData.bac;
    ormEntity.plannedPercentage = activity.progressData.plannedPercentage;
    ormEntity.actualPercentage = activity.progressData.actualPercentage;
    ormEntity.actualCost = activity.progressData.actualCost;
    return ormEntity;
  }
}
