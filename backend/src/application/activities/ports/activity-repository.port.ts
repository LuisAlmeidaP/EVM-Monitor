import { Activity } from '../../../domain/activities/activity';

export const ACTIVITY_REPOSITORY = Symbol('ACTIVITY_REPOSITORY');

export interface ActivityRepositoryPort {
  save(activity: Activity): Promise<Activity>;
  findAllByProject(projectId: string): Promise<Activity[]>;
  findById(id: string): Promise<Activity | null>;
  delete(id: string): Promise<void>;
}
