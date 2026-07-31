import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from './../src/infrastructure/filters/global-exception.filter';
import { ProjectOrmEntity } from './../src/infrastructure/projects/entities/project.orm-entity';
import { ActivityOrmEntity } from './../src/infrastructure/activities/entities/activity.orm-entity';
import type { ErrorResponseBody } from './../src/infrastructure/filters/error-response.interface';

interface ProjectResponseBody {
  readonly id: string;
  readonly nombre: string;
}

interface DeleteProjectResponseBody {
  readonly mensaje: string;
}

interface ProjectEvmAnalysisResponseBody {
  readonly proyectoId: string;
  readonly cantidadActividades: number;
  readonly indicadores: {
    readonly pv: number;
    readonly ev: number;
    readonly cv: number;
    readonly sv: number;
    readonly cpi: number | null;
    readonly spi: number | null;
    readonly eac: number | null;
    readonly vac: number | null;
  };
  readonly interpretacion: {
    readonly estadoCosto: string | null;
    readonly estadoCronograma: string | null;
  };
  readonly estadoGeneral: string | null;
}

const VALID_BUT_NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

async function createProject(
  app: INestApplication<App>,
  nombre: string,
): Promise<ProjectResponseBody> {
  const response = await request(app.getHttpServer())
    .post('/proyectos')
    .send({ nombre });
  return response.body as ProjectResponseBody;
}

async function createActivity(
  app: INestApplication<App>,
  proyectoId: string,
  overrides: Partial<{
    nombre: string;
    bac: number;
    porcentajeAvancePlanificado: number;
    porcentajeAvanceReal: number;
    costoReal: number;
  }> = {},
): Promise<void> {
  await request(app.getHttpServer())
    .post(`/proyectos/${proyectoId}/actividades`)
    .send({
      nombre: 'Excavación',
      bac: 100_000,
      porcentajeAvancePlanificado: 50,
      porcentajeAvanceReal: 40,
      costoReal: 50_000,
      ...overrides,
    });
}

describe('Proyectos (e2e)', () => {
  let app: INestApplication<App>;
  let projectRepository: Repository<ProjectOrmEntity>;
  let activityRepository: Repository<ActivityOrmEntity>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    projectRepository = moduleFixture.get<Repository<ProjectOrmEntity>>(
      getRepositoryToken(ProjectOrmEntity),
    );
    activityRepository = moduleFixture.get<Repository<ActivityOrmEntity>>(
      getRepositoryToken(ActivityOrmEntity),
    );
  });

  beforeEach(async () => {
    await activityRepository.clear();
    await projectRepository.clear();
  });

  afterAll(async () => {
    await activityRepository.clear();
    await projectRepository.clear();
    await app.close();
  });

  describe('POST /proyectos', () => {
    it('creates a project and returns its contract shape', async () => {
      const response = await request(app.getHttpServer())
        .post('/proyectos')
        .send({ nombre: 'Torre Norte' })
        .expect(201);

      const body = response.body as ProjectResponseBody;
      expect(body).toEqual({
        id: expect.any(String) as string,
        nombre: 'Torre Norte',
      });
    });

    it('rejects a request with a missing nombre (validation error)', async () => {
      const response = await request(app.getHttpServer())
        .post('/proyectos')
        .send({})
        .expect(400);

      const body = response.body as ErrorResponseBody;
      expect(body).toMatchObject({
        categoria: 'validacion',
        mensaje: expect.any(String) as string,
        referencia: expect.any(String) as string,
      });
    });

    it('rejects a request with an empty nombre (validation error)', async () => {
      await request(app.getHttpServer())
        .post('/proyectos')
        .send({ nombre: '' })
        .expect(400);
    });

    it('rejects a whitespace-only nombre as a business rule violation, not a structural one', async () => {
      const response = await request(app.getHttpServer())
        .post('/proyectos')
        .send({ nombre: '   ' })
        .expect(422);

      const body = response.body as ErrorResponseBody;
      expect(body.categoria).toBe('negocio');
    });

    it('rejects unknown extra fields in the request body', async () => {
      await request(app.getHttpServer())
        .post('/proyectos')
        .send({ nombre: 'Torre Norte', campoDesconocido: 'x' })
        .expect(400);
    });
  });

  describe('GET /proyectos', () => {
    it('returns an empty list when there are no projects', async () => {
      const response = await request(app.getHttpServer())
        .get('/proyectos')
        .expect(200);

      expect(response.body as ProjectResponseBody[]).toEqual([]);
    });

    it('returns every created project', async () => {
      await createProject(app, 'Proyecto A');
      await createProject(app, 'Proyecto B');

      const response = await request(app.getHttpServer())
        .get('/proyectos')
        .expect(200);

      expect(response.body as ProjectResponseBody[]).toHaveLength(2);
    });
  });

  describe('GET /proyectos/:proyectoId', () => {
    it('returns the project when it exists', async () => {
      const created = await createProject(app, 'Torre Norte');

      const response = await request(app.getHttpServer())
        .get(`/proyectos/${created.id}`)
        .expect(200);

      expect(response.body as ProjectResponseBody).toEqual({
        id: created.id,
        nombre: 'Torre Norte',
      });
    });

    it('returns 404 with the uniform error contract when the project does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get(`/proyectos/${VALID_BUT_NON_EXISTENT_ID}`)
        .expect(404);

      const body = response.body as ErrorResponseBody;
      expect(body).toMatchObject({
        categoria: 'no_encontrado',
        mensaje: expect.any(String) as string,
        referencia: expect.any(String) as string,
      });
    });

    it('returns 400 when the id is not a valid UUID', async () => {
      await request(app.getHttpServer())
        .get('/proyectos/not-a-uuid')
        .expect(400);
    });
  });

  describe('PUT /proyectos/:proyectoId', () => {
    it('updates the project name', async () => {
      const created = await createProject(app, 'Nombre Original');

      const response = await request(app.getHttpServer())
        .put(`/proyectos/${created.id}`)
        .send({ nombre: 'Nombre Actualizado' })
        .expect(200);

      expect(response.body as ProjectResponseBody).toEqual({
        id: created.id,
        nombre: 'Nombre Actualizado',
      });
    });

    it('returns 404 when updating a project that does not exist', async () => {
      await request(app.getHttpServer())
        .put(`/proyectos/${VALID_BUT_NON_EXISTENT_ID}`)
        .send({ nombre: 'Nuevo Nombre' })
        .expect(404);
    });

    it('rejects an update with an empty nombre', async () => {
      const created = await createProject(app, 'Nombre Original');

      await request(app.getHttpServer())
        .put(`/proyectos/${created.id}`)
        .send({ nombre: '' })
        .expect(400);
    });
  });

  describe('DELETE /proyectos/:proyectoId', () => {
    it('deletes an existing project and returns a confirmation message', async () => {
      const created = await createProject(app, 'Torre Norte');

      const response = await request(app.getHttpServer())
        .delete(`/proyectos/${created.id}`)
        .expect(200);

      expect(response.body as DeleteProjectResponseBody).toEqual({
        mensaje: expect.any(String) as string,
      });
      await request(app.getHttpServer())
        .get(`/proyectos/${created.id}`)
        .expect(404);
    });

    it('returns 404 when deleting a project that does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/proyectos/${VALID_BUT_NON_EXISTENT_ID}`)
        .expect(404);
    });
  });

  describe('GET /proyectos/:proyectoId/analisis-evm', () => {
    it('returns the consolidated EVM analysis summed over every activity in the project', async () => {
      const proyecto = await createProject(app, 'Torre Norte');
      await createActivity(app, proyecto.id, {
        nombre: 'Excavación',
        bac: 100_000,
        porcentajeAvancePlanificado: 50,
        porcentajeAvanceReal: 40,
        costoReal: 50_000,
      });
      await createActivity(app, proyecto.id, {
        nombre: 'Cimentación',
        bac: 200_000,
        porcentajeAvancePlanificado: 30,
        porcentajeAvanceReal: 35,
        costoReal: 65_000,
      });

      const response = await request(app.getHttpServer())
        .get(`/proyectos/${proyecto.id}/analisis-evm`)
        .expect(200);

      const body = response.body as ProjectEvmAnalysisResponseBody;
      expect(body).toEqual({
        proyectoId: proyecto.id,
        cantidadActividades: 2,
        indicadores: {
          pv: 110_000,
          ev: 110_000,
          cv: -5_000,
          sv: 0,
          cpi: 110_000 / 115_000,
          spi: 1,
          eac: 300_000 / (110_000 / 115_000),
          vac: 300_000 - 300_000 / (110_000 / 115_000),
        },
        interpretacion: {
          estadoCosto: 'sobre_presupuesto',
          estadoCronograma: 'a_tiempo',
        },
        estadoGeneral: 'en_riesgo',
      });
    });

    it('returns a business error (422) when the project has no activities (edge case)', async () => {
      const proyecto = await createProject(app, 'Torre Sur');

      const response = await request(app.getHttpServer())
        .get(`/proyectos/${proyecto.id}/analisis-evm`)
        .expect(422);

      const body = response.body as ErrorResponseBody;
      expect(body).toMatchObject({
        categoria: 'negocio',
        mensaje: expect.any(String) as string,
        referencia: expect.any(String) as string,
      });
    });

    it('returns 404 with the uniform error contract when the project does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get(`/proyectos/${VALID_BUT_NON_EXISTENT_ID}/analisis-evm`)
        .expect(404);

      const body = response.body as ErrorResponseBody;
      expect(body).toMatchObject({
        categoria: 'no_encontrado',
        mensaje: expect.any(String) as string,
        referencia: expect.any(String) as string,
      });
    });

    it('returns 400 when the id is not a valid UUID', async () => {
      await request(app.getHttpServer())
        .get('/proyectos/not-a-uuid/analisis-evm')
        .expect(400);
    });

    it('only consolidates activities belonging to the given project (Proyecto-Actividad relationship)', async () => {
      const proyectoA = await createProject(app, 'Torre Norte');
      const proyectoB = await createProject(app, 'Torre Sur');
      await createActivity(app, proyectoA.id, { bac: 100_000 });
      await createActivity(app, proyectoB.id, { bac: 999_999 });

      const response = await request(app.getHttpServer())
        .get(`/proyectos/${proyectoA.id}/analisis-evm`)
        .expect(200);

      const body = response.body as ProjectEvmAnalysisResponseBody;
      expect(body.cantidadActividades).toBe(1);
      expect(body.indicadores.pv).toBe(50_000);
    });
  });
});
