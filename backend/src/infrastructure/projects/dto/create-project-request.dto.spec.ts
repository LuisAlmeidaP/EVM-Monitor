import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProjectRequestDto } from './create-project-request.dto';

async function validateDto(payload: Record<string, unknown>) {
  const dto = plainToInstance(CreateProjectRequestDto, payload);
  return validate(dto);
}

describe('CreateProjectRequestDto', () => {
  it('has no validation errors when nombre is a valid non-empty string', async () => {
    const errors = await validateDto({ nombre: 'Torre Norte' });

    expect(errors).toHaveLength(0);
  });

  it('reports a validation error when nombre is missing', async () => {
    const errors = await validateDto({});

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('nombre');
  });

  it('reports a validation error when nombre is an empty string', async () => {
    const errors = await validateDto({ nombre: '' });

    expect(errors).toHaveLength(1);
  });

  it('reports a validation error when nombre is not a string', async () => {
    const errors = await validateDto({ nombre: 12345 });

    expect(errors).toHaveLength(1);
  });

  it('reports a validation error when nombre exceeds the maximum length', async () => {
    const errors = await validateDto({ nombre: 'a'.repeat(256) });

    expect(errors).toHaveLength(1);
  });
});
