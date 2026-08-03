import { randomUUID } from 'crypto';
import { ActivityProgressData } from '../evm/activity-progress-data';
import type { ActivityProgressDataInput } from '../evm/activity-progress-data';
import { InvalidActivityNameException } from './exceptions/invalid-activity-name.exception';

export class Activity {
  private _name: string;
  private _progressData: ActivityProgressData;

  private constructor(
    public readonly id: string,
    public readonly projectId: string,
    name: string,
    progressData: ActivityProgressData,
  ) {
    this._name = name;
    this._progressData = progressData;
  }

  static create(
    projectId: string,
    name: string,
    progressInput: ActivityProgressDataInput,
  ): Activity {
    return new Activity(
      randomUUID(),
      projectId,
      Activity.normalizeName(name),
      ActivityProgressData.create(progressInput),
    );
  }

  /**
   * Reconstruye una Activity a partir de datos ya persistidos, preservando su
   * identidad y su proyecto existentes en vez de generarlos de nuevo.
   */
  static reconstitute(
    id: string,
    projectId: string,
    name: string,
    progressInput: ActivityProgressDataInput,
  ): Activity {
    return new Activity(
      id,
      projectId,
      name,
      ActivityProgressData.create(progressInput),
    );
  }

  get name(): string {
    return this._name;
  }

  get progressData(): ActivityProgressData {
    return this._progressData;
  }

  update(name: string, progressInput: ActivityProgressDataInput): void {
    this._name = Activity.normalizeName(name);
    this._progressData = ActivityProgressData.create(progressInput);
  }

  private static normalizeName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new InvalidActivityNameException();
    }
    return trimmed;
  }
}
