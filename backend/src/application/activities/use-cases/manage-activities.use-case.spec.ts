import { Activity } from '../../../domain/activities/activity';
import { Project } from '../../../domain/projects/project';
import { ResourceNotFoundException } from '../../exceptions/resource-not-found.exception';
import { InvalidActivityNameException } from '../../../domain/activities/exceptions/invalid-activity-name.exception';
import type { ActivityRepositoryPort } from '../ports/activity-repository.port';
import type { ProjectRepositoryPort } from '../../projects/ports/project-repository.port';
import { ManageActivitiesUseCase } from './manage-activities.use-case';

class InMemoryActivityRepository implements ActivityRepositoryPort {
  private readonly activities = new Map<string, Activity>();

  save(activity: Activity): Promise<Activity> {
    this.activities.set(activity.id, activity);
    return Promise.resolve(activity);
  }

  findAllByProject(projectId: string): Promise<Activity[]> {
    return Promise.resolve(
      Array.from(this.activities.values()).filter(
        (activity) => activity.projectId === projectId,
      ),
    );
  }

  findById(id: string): Promise<Activity | null> {
    return Promise.resolve(this.activities.get(id) ?? null);
  }

  delete(id: string): Promise<void> {
    this.activities.delete(id);
    return Promise.resolve();
  }
}

class InMemoryProjectRepository implements ProjectRepositoryPort {
  private readonly projects = new Map<string, Project>();

  save(project: Project): Promise<Project> {
    this.projects.set(project.id, project);
    return Promise.resolve(project);
  }

  findAll(): Promise<Project[]> {
    return Promise.resolve(Array.from(this.projects.values()));
  }

  findById(id: string): Promise<Project | null> {
    return Promise.resolve(this.projects.get(id) ?? null);
  }

  delete(id: string): Promise<void> {
    this.projects.delete(id);
    return Promise.resolve();
  }
}

const DATOS_VALIDOS = {
  bac: 100_000,
  plannedPercentage: 50,
  actualPercentage: 40,
  actualCost: 50_000,
};

describe('ManageActivitiesUseCase', () => {
  let activityRepository: InMemoryActivityRepository;
  let projectRepository: InMemoryProjectRepository;
  let useCase: ManageActivitiesUseCase;
  let proyectoExistente: Project;

  beforeEach(async () => {
    activityRepository = new InMemoryActivityRepository();
    projectRepository = new InMemoryProjectRepository();
    useCase = new ManageActivitiesUseCase(
      activityRepository,
      projectRepository,
    );
    proyectoExistente = await projectRepository.save(
      Project.create('Torre Norte'),
    );
  });

  describe('create', () => {
    it('creates an activity when the project exists', async () => {
      const activity = await useCase.create(
        proyectoExistente.id,
        'Excavación',
        DATOS_VALIDOS,
      );

      expect(activity.projectId).toBe(proyectoExistente.id);
      expect(activity.name).toBe('Excavación');
    });

    it('throws ResourceNotFoundException when the project does not exist (Proyecto-Actividad relationship)', async () => {
      await expect(
        useCase.create('non-existent-project', 'Excavación', DATOS_VALIDOS),
      ).rejects.toThrow(ResourceNotFoundException);
    });

    it('propagates the domain validation error for an invalid name', async () => {
      await expect(
        useCase.create(proyectoExistente.id, '   ', DATOS_VALIDOS),
      ).rejects.toThrow(InvalidActivityNameException);
    });
  });

  describe('findAllByProject', () => {
    it('returns only the activities belonging to the given project (Proyecto-Actividad relationship)', async () => {
      const otroProyecto = await projectRepository.save(
        Project.create('Torre Sur'),
      );
      await useCase.create(proyectoExistente.id, 'Actividad A', DATOS_VALIDOS);
      await useCase.create(otroProyecto.id, 'Actividad B', DATOS_VALIDOS);

      const actividades = await useCase.findAllByProject(proyectoExistente.id);

      expect(actividades).toHaveLength(1);
      expect(actividades[0].name).toBe('Actividad A');
    });

    it('returns an empty array when the project has no activities (edge case)', async () => {
      await expect(
        useCase.findAllByProject(proyectoExistente.id),
      ).resolves.toEqual([]);
    });

    it('throws ResourceNotFoundException when the project does not exist', async () => {
      await expect(
        useCase.findAllByProject('non-existent-project'),
      ).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe('findById', () => {
    it('returns the activity when it exists', async () => {
      const created = await useCase.create(
        proyectoExistente.id,
        'Excavación',
        DATOS_VALIDOS,
      );

      await expect(useCase.findById(created.id)).resolves.toBe(created);
    });

    it('throws ResourceNotFoundException when the activity does not exist', async () => {
      await expect(useCase.findById('non-existent-id')).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates an existing activity and persists the change', async () => {
      const created = await useCase.create(
        proyectoExistente.id,
        'Nombre Original',
        DATOS_VALIDOS,
      );

      const updated = await useCase.update(created.id, 'Nombre Actualizado', {
        ...DATOS_VALIDOS,
        actualPercentage: 70,
      });

      expect(updated.name).toBe('Nombre Actualizado');
      expect(updated.progressData.actualPercentage).toBe(70);
    });

    it('throws ResourceNotFoundException when updating an activity that does not exist', async () => {
      await expect(
        useCase.update('non-existent-id', 'Nuevo Nombre', DATOS_VALIDOS),
      ).rejects.toThrow(ResourceNotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes an existing activity', async () => {
      const created = await useCase.create(
        proyectoExistente.id,
        'Excavación',
        DATOS_VALIDOS,
      );

      await useCase.delete(created.id);

      await expect(useCase.findById(created.id)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });

    it('throws ResourceNotFoundException when deleting an activity that does not exist', async () => {
      await expect(useCase.delete('non-existent-id')).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });
});
