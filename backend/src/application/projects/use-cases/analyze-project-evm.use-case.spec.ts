import { Activity } from '../../../domain/activities/activity';
import { EmptyProjectActivitiesException } from '../../../domain/evm/exceptions/empty-project-activities.exception';
import { EvmProjectAnalyzer } from '../../../domain/evm/evm-project-analyzer';
import { Project } from '../../../domain/projects/project';
import { ResourceNotFoundException } from '../../exceptions/resource-not-found.exception';
import { ManageActivitiesUseCase } from '../../activities/use-cases/manage-activities.use-case';
import type { ActivityRepositoryPort } from '../../activities/ports/activity-repository.port';
import type { ProjectRepositoryPort } from '../ports/project-repository.port';
import { AnalyzeProjectEvmUseCase } from './analyze-project-evm.use-case';

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

describe('AnalyzeProjectEvmUseCase', () => {
  let activityRepository: InMemoryActivityRepository;
  let projectRepository: InMemoryProjectRepository;
  let manageActivitiesUseCase: ManageActivitiesUseCase;
  let useCase: AnalyzeProjectEvmUseCase;

  beforeEach(() => {
    activityRepository = new InMemoryActivityRepository();
    projectRepository = new InMemoryProjectRepository();
    manageActivitiesUseCase = new ManageActivitiesUseCase(
      activityRepository,
      projectRepository,
    );
    useCase = new AnalyzeProjectEvmUseCase(manageActivitiesUseCase);
  });

  it('retrieves the project activities and delegates consolidation entirely to the domain (EvmProjectAnalyzer)', async () => {
    const proyecto = await projectRepository.save(
      Project.create('Torre Norte'),
    );
    const actividadA = await manageActivitiesUseCase.create(
      proyecto.id,
      'Excavación',
      DATOS_VALIDOS,
    );
    const actividadB = await manageActivitiesUseCase.create(
      proyecto.id,
      'Cimentación',
      {
        ...DATOS_VALIDOS,
        bac: 200_000,
      },
    );

    const resultado = await useCase.execute(proyecto.id);

    const analisisEsperado = new EvmProjectAnalyzer().analyze([
      actividadA.progressData,
      actividadB.progressData,
    ]);
    expect(resultado.projectId).toBe(proyecto.id);
    expect(resultado.activityCount).toBe(2);
    expect(resultado.analysis).toEqual(analisisEsperado);
  });

  it('throws ResourceNotFoundException when the project does not exist', async () => {
    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      ResourceNotFoundException,
    );
  });

  it('throws EmptyProjectActivitiesException when the project has no activities (edge case)', async () => {
    const proyecto = await projectRepository.save(Project.create('Torre Sur'));

    await expect(useCase.execute(proyecto.id)).rejects.toThrow(
      EmptyProjectActivitiesException,
    );
  });

  it('only consolidates activities belonging to the given project (Proyecto-Actividad relationship)', async () => {
    const proyectoA = await projectRepository.save(
      Project.create('Torre Norte'),
    );
    const proyectoB = await projectRepository.save(Project.create('Torre Sur'));
    await manageActivitiesUseCase.create(
      proyectoA.id,
      'Excavación',
      DATOS_VALIDOS,
    );
    await manageActivitiesUseCase.create(proyectoB.id, 'Otra actividad', {
      ...DATOS_VALIDOS,
      bac: 999_999,
    });

    const resultado = await useCase.execute(proyectoA.id);

    expect(resultado.activityCount).toBe(1);
    expect(resultado.analysis.indicators.pv).toBe(50_000);
  });
});
