import { randomUUID } from 'crypto';
import { InvalidProjectNameException } from './exceptions/invalid-project-name.exception';

export class Project {
  private _name: string;

  private constructor(
    public readonly id: string,
    name: string,
  ) {
    this._name = name;
  }

  static create(name: string): Project {
    const normalizedName = Project.normalize(name);
    return new Project(randomUUID(), normalizedName);
  }

  /**
   * Reconstruye un Project a partir de datos ya persistidos, preservando su
   * identidad existente en vez de generar una nueva.
   */
  static reconstitute(id: string, name: string): Project {
    return new Project(id, name);
  }

  get name(): string {
    return this._name;
  }

  rename(name: string): void {
    this._name = Project.normalize(name);
  }

  private static normalize(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new InvalidProjectNameException();
    }
    return trimmed;
  }
}
