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

const VALID_BUT_NON_EXISTENT_ID = '00000000-0000-0000-0000-000000000000';

interface ProjectResponseBody {
  readonly id: string;
  readonly nombre: string;
}

interface ActivityResponseBody {
  readonly id: string;
  readonly proyectoId: string;
  readonly nombre: string;
  readonly bac: number;
  readonly porcentajeAvancePlanificado: number;
  readonly porcentajeAvanceReal: number;
  readonly costoReal: number;
}

interface DeleteActivityResponseBody {
  readonly mensaje: string;
}

const DATOS_VALIDOS = {
  nombre: 'Excavación',
  bac: 100_000,
  porcentajeAvancePlanificado: 50,
  porcentajeAvanceReal: 40,
  costoReal: 50_000,
};

async function crearProyecto(
  app: INestApplication<App>,
  nombre: string,
): Promise<ProjectResponseBody> {
  const response = await request(app.getHttpServer())
    .post('/proyectos')
    .send({ nombre });
  return response.body as ProjectResponseBody;
}

describe('Actividades (e2e)', () => {
  let app: INestApplication<App>;
  let projectRepository: Repository<ProjectOrmEntity>;
  let activityRepository: Repository<ActivityOrmEntity>;
  let proyecto: ProjectResponseBody;

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
    proyecto = await crearProyecto(app, 'Torre Norte');
  });

  afterAll(async () => {
    await activityRepository.clear();
    await projectRepository.clear();
    await app.close();
  });

  describe('POST /proyectos/:proyectoId/actividades', () => {
    it('creates an activity for an existing project and returns its contract shape', async () => {
      const response = await request(app.getHttpServer())
        .post(`/proyectos/${proyecto.id}/actividades`)
        .send(DATOS_VALIDOS)
        .expect(201);

      const body = response.body as ActivityResponseBody;
      expect(body).toEqual({
        id: expect.any(String) as string,
        proyectoId: proyecto.id,
        nombre: 'Excavación',
        bac: 100_000,
        porcentajeAvancePlanificado: 50,
        porcentajeAvanceReal: 40,
        costoReal: 50_000,
      });
    });

    it('returns 404 when the project does not exist (Proyecto-Actividad relationship)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/proyectos/${VALID_BUT_NON_EXISTENT_ID}/actividades`)
        .send(DATOS_VALIDOS)
        .expect(404);

      const body = response.body as ErrorResponseBody;
      expect(body.categoria).toBe('no_encontrado');
    });

    it('rejects a request with a missing nombre (validation error)', async () => {
      const sinNombre: Record<string, unknown> = { ...DATOS_VALIDOS };
      delete sinNombre.nombre;
      await request(app.getHttpServer())
        .post(`/proyectos/${proyecto.id}/actividades`)
        .send(sinNombre)
        .expect(400);
    });

    it('rejects a negative bac as a business rule violation, not a structural one', async () => {
      const response = await request(app.getHttpServer())
        .post(`/proyectos/${proyecto.id}/actividades`)
        .send({ ...DATOS_VALIDOS, bac: -1 })
        .expect(422);

      const body = response.body as ErrorResponseBody;
      expect(body.categoria).toBe('negocio');
    });

    it('accepts an actual cost of zero (EVM edge case, not a validation error)', async () => {
      await request(app.getHttpServer())
        .post(`/proyectos/${proyecto.id}/actividades`)
        .send({ ...DATOS_VALIDOS, costoReal: 0 })
        .expect(201);
    });
  });

  describe('GET /proyectos/:proyectoId/actividades', () => {
    it('returns an empty list when the project has no activities', async () => {
      const response = await request(app.getHttpServer())
        .get(`/proyectos/${proyecto.id}/actividades`)
        .expect(200);

      expect(response.body as ActivityResponseBody[]).toEqual([]);
    });

    it('returns only the activities belonging to the given project (Proyecto-Actividad relationship)', async () => {
      const otroProyecto = await crearProyecto(app, 'Torre Sur');
      await request(app.getHttpServer())
        .post(`/proyectos/${proyecto.id}/actividades`)
        .send(DATOS_VALIDOS);
      await request(app.getHttpServer())
        .post(`/proyectos/${otroProyecto.id}/actividades`)
        .send({ ...DATOS_VALIDOS, nombre: 'Otra actividad' });

      const response = await request(app.getHttpServer())
        .get(`/proyectos/${proyecto.id}/actividades`)
        .expect(200);

      const body = response.body as ActivityResponseBody[];
      expect(body).toHaveLength(1);
      expect(body[0].nombre).toBe('Excavación');
    });

    it('returns 404 when the project does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/proyectos/${VALID_BUT_NON_EXISTENT_ID}/actividades`)
        .expect(404);
    });
  });

  describe('GET /actividades/:actividadId', () => {
    it('returns the activity when it exists', async () => {
      const created = await request(app.getHttpServer())
        .post(`/proyectos/${proyecto.id}/actividades`)
        .send(DATOS_VALIDOS);
      const createdBody = created.body as ActivityResponseBody;

      const response = await request(app.getHttpServer())
        .get(`/actividades/${createdBody.id}`)
        .expect(200);

      expect(response.body as ActivityResponseBody).toEqual(createdBody);
    });

    it('returns 404 with the uniform error contract when the activity does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get(`/actividades/${VALID_BUT_NON_EXISTENT_ID}`)
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
        .get('/actividades/not-a-uuid')
        .expect(400);
    });
  });

  describe('PUT /actividades/:actividadId', () => {
    it('updates the activity data', async () => {
      const created = await request(app.getHttpServer())
        .post(`/proyectos/${proyecto.id}/actividades`)
        .send(DATOS_VALIDOS);
      const createdBody = created.body as ActivityResponseBody;

      const response = await request(app.getHttpServer())
        .put(`/actividades/${createdBody.id}`)
        .send({
          ...DATOS_VALIDOS,
          nombre: 'Excavación actualizada',
          porcentajeAvanceReal: 70,
        })
        .expect(200);

      const body = response.body as ActivityResponseBody;
      expect(body.nombre).toBe('Excavación actualizada');
      expect(body.porcentajeAvanceReal).toBe(70);
      expect(body.proyectoId).toBe(proyecto.id);
    });

    it('returns 404 when updating an activity that does not exist', async () => {
      await request(app.getHttpServer())
        .put(`/actividades/${VALID_BUT_NON_EXISTENT_ID}`)
        .send(DATOS_VALIDOS)
        .expect(404);
    });

    it('rejects an update with a planned percentage above 100', async () => {
      const created = await request(app.getHttpServer())
        .post(`/proyectos/${proyecto.id}/actividades`)
        .send(DATOS_VALIDOS);
      const createdBody = created.body as ActivityResponseBody;

      const response = await request(app.getHttpServer())
        .put(`/actividades/${createdBody.id}`)
        .send({ ...DATOS_VALIDOS, porcentajeAvancePlanificado: 150 })
        .expect(422);

      const body = response.body as ErrorResponseBody;
      expect(body.categoria).toBe('negocio');
    });
  });

  describe('DELETE /actividades/:actividadId', () => {
    it('deletes an existing activity and returns a confirmation message', async () => {
      const created = await request(app.getHttpServer())
        .post(`/proyectos/${proyecto.id}/actividades`)
        .send(DATOS_VALIDOS);
      const createdBody = created.body as ActivityResponseBody;

      const response = await request(app.getHttpServer())
        .delete(`/actividades/${createdBody.id}`)
        .expect(200);

      expect(response.body as DeleteActivityResponseBody).toEqual({
        mensaje: expect.any(String) as string,
      });
      await request(app.getHttpServer())
        .get(`/actividades/${createdBody.id}`)
        .expect(404);
    });

    it('returns 404 when deleting an activity that does not exist', async () => {
      await request(app.getHttpServer())
        .delete(`/actividades/${VALID_BUT_NON_EXISTENT_ID}`)
        .expect(404);
    });
  });
});
