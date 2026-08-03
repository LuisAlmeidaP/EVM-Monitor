export abstract class DomainException extends Error {
  protected constructor(
    message: string,
    public readonly details?: string[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}
