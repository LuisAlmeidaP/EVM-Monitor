import { Project } from '../../../domain/projects/project';
import { ResourceNotFoundException } from '../../exceptions/resource-not-found.exception';
import { InvalidProjectNameException } from '../../../domain/projects/exceptions/invalid-project-name.exception';
import { ProjectRepositoryPort } from '../ports/project-repository.port';
import { ManageProjectsUseCase } from './manage-projects.use-case';

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

describe('ManageProjectsUseCase', () => {
  let repository: InMemoryProjectRepository;
  let useCase: ManageProjectsUseCase;

  beforeEach(() => {
    repository = new InMemoryProjectRepository();
    useCase = new ManageProjectsUseCase(repository);
  });

  describe('create', () => {
    it('creates and persists a new project', async () => {
      const project = await useCase.create('Torre Norte');

      expect(project.name).toBe('Torre Norte');
      await expect(useCase.findById(project.id)).resolves.toBe(project);
    });

    it('propagates the domain validation error for an invalid name', async () => {
      await expect(useCase.create('   ')).rejects.toThrow(
        InvalidProjectNameException,
      );
    });
  });

  describe('findAll', () => {
    it('returns every persisted project', async () => {
      await useCase.create('Proyecto A');
      await useCase.create('Proyecto B');

      const projects = await useCase.findAll();

      expect(projects).toHaveLength(2);
    });

    it('returns an empty array when there are no projects (edge case)', async () => {
      await expect(useCase.findAll()).resolves.toEqual([]);
    });
  });

  describe('findById', () => {
    it('returns the project when it exists', async () => {
      const created = await useCase.create('Torre Norte');

      const found = await useCase.findById(created.id);

      expect(found).toBe(created);
    });

    it('throws ResourceNotFoundException when the project does not exist', async () => {
      await expect(useCase.findById('non-existent-id')).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('renames an existing project and persists the change', async () => {
      const created = await useCase.create('Nombre Original');

      const updated = await useCase.update(created.id, 'Nombre Actualizado');

      expect(updated.name).toBe('Nombre Actualizado');
      await expect(useCase.findById(created.id)).resolves.toHaveProperty(
        'name',
        'Nombre Actualizado',
      );
    });

    it('throws ResourceNotFoundException when updating a project that does not exist', async () => {
      await expect(
        useCase.update('non-existent-id', 'Nuevo Nombre'),
      ).rejects.toThrow(ResourceNotFoundException);
    });

    it('propagates the domain validation error for an invalid new name', async () => {
      const created = await useCase.create('Nombre Original');

      await expect(useCase.update(created.id, '')).rejects.toThrow(
        InvalidProjectNameException,
      );
    });
  });

  describe('delete', () => {
    it('deletes an existing project', async () => {
      const created = await useCase.create('Torre Norte');

      await useCase.delete(created.id);

      await expect(useCase.findById(created.id)).rejects.toThrow(
        ResourceNotFoundException,
      );
    });

    it('throws ResourceNotFoundException when deleting a project that does not exist', async () => {
      await expect(useCase.delete('non-existent-id')).rejects.toThrow(
        ResourceNotFoundException,
      );
    });
  });
});
