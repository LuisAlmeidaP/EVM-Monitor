import { Activity } from './activity';
import { InvalidActivityNameException } from './exceptions/invalid-activity-name.exception';
import { InvalidActivityProgressDataException } from '../evm/exceptions/invalid-activity-progress-data.exception';

const PROJECT_ID = 'project-1';
const DATOS_VALIDOS = {
  bac: 100_000,
  plannedPercentage: 50,
  actualPercentage: 40,
  actualCost: 50_000,
};

describe('Activity', () => {
  describe('create', () => {
    it('creates an activity with a generated id, its project reference and the given data', () => {
      const activity = Activity.create(PROJECT_ID, 'Excavación', DATOS_VALIDOS);

      expect(activity.id).toEqual(expect.any(String));
      expect(activity.projectId).toBe(PROJECT_ID);
      expect(activity.name).toBe('Excavación');
      expect(activity.progressData.bac).toBe(100_000);
    });

    it('trims surrounding whitespace from the name', () => {
      const activity = Activity.create(
        PROJECT_ID,
        '  Excavación  ',
        DATOS_VALIDOS,
      );

      expect(activity.name).toBe('Excavación');
    });

    it('generates a different id for each activity', () => {
      const first = Activity.create(PROJECT_ID, 'Actividad A', DATOS_VALIDOS);
      const second = Activity.create(PROJECT_ID, 'Actividad B', DATOS_VALIDOS);

      expect(first.id).not.toBe(second.id);
    });

    it('rejects an empty name', () => {
      expect(() => Activity.create(PROJECT_ID, '', DATOS_VALIDOS)).toThrow(
        InvalidActivityNameException,
      );
    });

    it('rejects a whitespace-only name (edge case not caught by basic emptiness checks)', () => {
      expect(() => Activity.create(PROJECT_ID, '   ', DATOS_VALIDOS)).toThrow(
        InvalidActivityNameException,
      );
    });

    it('reuses the EVM domain validation for the progress data, without duplicating it', () => {
      expect(() =>
        Activity.create(PROJECT_ID, 'Excavación', {
          ...DATOS_VALIDOS,
          bac: -1,
        }),
      ).toThrow(InvalidActivityProgressDataException);
    });

    it('accepts an actual cost of zero, since it is a valid EVM edge case', () => {
      expect(() =>
        Activity.create(PROJECT_ID, 'Excavación', {
          ...DATOS_VALIDOS,
          actualCost: 0,
        }),
      ).not.toThrow();
    });
  });

  describe('reconstitute', () => {
    it('rebuilds an activity preserving the given id and project instead of generating new ones', () => {
      const activity = Activity.reconstitute(
        'existing-id',
        PROJECT_ID,
        'Excavación',
        DATOS_VALIDOS,
      );

      expect(activity.id).toBe('existing-id');
      expect(activity.projectId).toBe(PROJECT_ID);
    });
  });

  describe('update', () => {
    it('updates the name and progress data when both are valid', () => {
      const activity = Activity.create(
        PROJECT_ID,
        'Nombre Original',
        DATOS_VALIDOS,
      );

      activity.update('Nombre Actualizado', {
        ...DATOS_VALIDOS,
        actualPercentage: 60,
      });

      expect(activity.name).toBe('Nombre Actualizado');
      expect(activity.progressData.actualPercentage).toBe(60);
    });

    it('preserves identity and project after updating', () => {
      const activity = Activity.create(
        PROJECT_ID,
        'Nombre Original',
        DATOS_VALIDOS,
      );
      const { id, projectId } = activity;

      activity.update('Nombre Actualizado', DATOS_VALIDOS);

      expect(activity.id).toBe(id);
      expect(activity.projectId).toBe(projectId);
    });

    it('rejects updating to an empty name', () => {
      const activity = Activity.create(
        PROJECT_ID,
        'Nombre Original',
        DATOS_VALIDOS,
      );

      expect(() => activity.update('', DATOS_VALIDOS)).toThrow(
        InvalidActivityNameException,
      );
    });

    it('rejects updating to invalid progress data', () => {
      const activity = Activity.create(
        PROJECT_ID,
        'Nombre Original',
        DATOS_VALIDOS,
      );

      expect(() =>
        activity.update('Nombre Original', {
          ...DATOS_VALIDOS,
          plannedPercentage: 150,
        }),
      ).toThrow(InvalidActivityProgressDataException);
    });
  });
});
