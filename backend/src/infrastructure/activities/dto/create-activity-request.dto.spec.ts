import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateActivityRequestDto } from './create-activity-request.dto';

const PAYLOAD_VALIDO = {
  nombre: 'Excavación',
  bac: 100_000,
  porcentajeAvancePlanificado: 50,
  porcentajeAvanceReal: 40,
  costoReal: 50_000,
};

async function validateDto(payload: Record<string, unknown>) {
  const dto = plainToInstance(CreateActivityRequestDto, payload);
  return validate(dto);
}

describe('CreateActivityRequestDto', () => {
  it('has no validation errors for a fully valid payload', async () => {
    const errors = await validateDto(PAYLOAD_VALIDO);

    expect(errors).toHaveLength(0);
  });

  it('reports a validation error when nombre is missing', async () => {
    const sinNombre: Record<string, unknown> = { ...PAYLOAD_VALIDO };
    delete sinNombre.nombre;
    const errors = await validateDto(sinNombre);

    expect(errors.some((error) => error.property === 'nombre')).toBe(true);
  });

  it('reports a validation error when a numeric field is missing', async () => {
    const sinBac: Record<string, unknown> = { ...PAYLOAD_VALIDO };
    delete sinBac.bac;
    const errors = await validateDto(sinBac);

    expect(errors.some((error) => error.property === 'bac')).toBe(true);
  });

  it('reports a validation error when a numeric field is not a number', async () => {
    const errors = await validateDto({
      ...PAYLOAD_VALIDO,
      costoReal: 'no-es-un-numero',
    });

    expect(errors.some((error) => error.property === 'costoReal')).toBe(true);
  });

  it('does not reject a negative bac at the structural level (it is a business rule, not a shape rule)', async () => {
    const errors = await validateDto({ ...PAYLOAD_VALIDO, bac: -1 });

    expect(errors).toHaveLength(0);
  });
});
