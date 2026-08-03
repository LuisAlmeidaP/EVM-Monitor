import { Project } from './project';
import { InvalidProjectNameException } from './exceptions/invalid-project-name.exception';

describe('Project', () => {
  describe('create', () => {
    it('creates a project with a generated id and the given name', () => {
      const project = Project.create('Torre Norte');

      expect(project.id).toEqual(expect.any(String));
      expect(project.id.length).toBeGreaterThan(0);
      expect(project.name).toBe('Torre Norte');
    });

    it('trims surrounding whitespace from the name', () => {
      const project = Project.create('  Torre Norte  ');

      expect(project.name).toBe('Torre Norte');
    });

    it('generates a different id for each project', () => {
      const first = Project.create('Proyecto A');
      const second = Project.create('Proyecto B');

      expect(first.id).not.toBe(second.id);
    });

    it('rejects an empty name', () => {
      expect(() => Project.create('')).toThrow(InvalidProjectNameException);
    });

    it('rejects a whitespace-only name (edge case not caught by basic emptiness checks)', () => {
      expect(() => Project.create('   ')).toThrow(InvalidProjectNameException);
    });
  });

  describe('reconstitute', () => {
    it('rebuilds a project preserving the given id instead of generating a new one', () => {
      const project = Project.reconstitute('existing-id', 'Torre Norte');

      expect(project.id).toBe('existing-id');
      expect(project.name).toBe('Torre Norte');
    });
  });

  describe('rename', () => {
    it('updates the name when it is valid', () => {
      const project = Project.create('Nombre Original');

      project.rename('Nombre Actualizado');

      expect(project.name).toBe('Nombre Actualizado');
    });

    it('preserves the identity of the project after renaming', () => {
      const project = Project.create('Nombre Original');
      const originalId = project.id;

      project.rename('Nombre Actualizado');

      expect(project.id).toBe(originalId);
    });

    it('rejects renaming to an empty name', () => {
      const project = Project.create('Nombre Original');

      expect(() => project.rename('')).toThrow(InvalidProjectNameException);
    });
  });
});
