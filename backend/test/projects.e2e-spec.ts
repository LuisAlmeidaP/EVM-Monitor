import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from './../src/infrastructure/filters/global-exception.filter';
import { ProjectOrmEntity } from './../src/infrastructure/projects/entities/project.orm-entity';
import type { ErrorResponseBody } from './../src/infrastructure/filters/error-response.interface';

interface ProjectResponseBody {
  readonly id: string;
  readonly nombre: string;
}

interface DeleteProjectResponseBody {
  readonly mensaje: string;
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

describe('Proyectos (e2e)', () => {
  let app: INestApplication<App>;
  let projectRepository: Repository<ProjectOrmEntity>;

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
  });

  beforeEach(async () => {
    await projectRepository.clear();
  });

  afterAll(async () => {
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
});
