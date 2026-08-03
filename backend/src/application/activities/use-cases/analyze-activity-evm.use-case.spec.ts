import { Activity } from '../../../domain/activities/activity';
import { EvmAnalyzer } from '../../../domain/evm/evm-analyzer';
import { Project } from '../../../domain/projects/project';
import { ResourceNotFoundException } from '../../exceptions/resource-not-found.exception';
import type { ActivityRepositoryPort } from '../ports/activity-repository.port';
import type { ProjectRepositoryPort } from '../../projects/ports/project-repository.port';
import { AnalyzeActivityEvmUseCase } from './analyze-activity-evm.use-case';
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

describe('AnalyzeActivityEvmUseCase', () => {
  let activityRepository: InMemoryActivityRepository;
  let projectRepository: InMemoryProjectRepository;
  let manageActivitiesUseCase: ManageActivitiesUseCase;
  let useCase: AnalyzeActivityEvmUseCase;

  beforeEach(() => {
    activityRepository = new InMemoryActivityRepository();
    projectRepository = new InMemoryProjectRepository();
    manageActivitiesUseCase = new ManageActivitiesUseCase(
      activityRepository,
      projectRepository,
    );
    useCase = new AnalyzeActivityEvmUseCase(manageActivitiesUseCase);
  });

  it('retrieves the activity and delegates the calculation entirely to the domain (EvmAnalyzer)', async () => {
    const proyecto = await projectRepository.save(
      Project.create('Torre Norte'),
    );
    const actividad = await manageActivitiesUseCase.create(
      proyecto.id,
      'Excavación',
      DATOS_VALIDOS,
    );

    const resultado = await useCase.execute(actividad.id);

    const analisisEsperado = new EvmAnalyzer().analyze(actividad.progressData);
    expect(resultado.activity).toBe(actividad);
    expect(resultado.analysis).toEqual(analisisEsperado);
  });

  it('throws ResourceNotFoundException when the activity does not exist', async () => {
    await expect(useCase.execute('non-existent-id')).rejects.toThrow(
      ResourceNotFoundException,
    );
  });

  it('returns a null overall status for the edge case where AC is zero', async () => {
    const proyecto = await projectRepository.save(
      Project.create('Torre Norte'),
    );
    const actividad = await manageActivitiesUseCase.create(
      proyecto.id,
      'Excavación',
      { ...DATOS_VALIDOS, actualPercentage: 0, actualCost: 0 },
    );

    const { analysis } = await useCase.execute(actividad.id);

    expect(analysis.indicators.cpi).toBeNull();
    expect(analysis.overallStatus).toBeNull();
  });
});
