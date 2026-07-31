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

interface ActivityEvmAnalysisResponseBody {
  readonly actividadId: string;
  readonly proyectoId: string;
  readonly nombre: string;
  readonly datosAvance: {
    readonly bac: number;
    readonly porcentajeAvancePlanificado: number;
    readonly porcentajeAvanceReal: number;
    readonly costoReal: number;
  };
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

  describe('GET /actividades/:actividadId/analisis-evm', () => {
    it('returns the full EVM analysis contract for an existing activity', async () => {
      const created = await request(app.getHttpServer())
        .post(`/proyectos/${proyecto.id}/actividades`)
        .send(DATOS_VALIDOS);
      const createdBody = created.body as ActivityResponseBody;

      const response = await request(app.getHttpServer())
        .get(`/actividades/${createdBody.id}/analisis-evm`)
        .expect(200);

      const body = response.body as ActivityEvmAnalysisResponseBody;
      expect(body).toEqual({
        actividadId: createdBody.id,
        proyectoId: proyecto.id,
        nombre: 'Excavación',
        datosAvance: {
          bac: 100_000,
          porcentajeAvancePlanificado: 50,
          porcentajeAvanceReal: 40,
          costoReal: 50_000,
        },
        indicadores: {
          pv: 50_000,
          ev: 40_000,
          cv: -10_000,
          sv: -10_000,
          cpi: 0.8,
          spi: 0.8,
          eac: 125_000,
          vac: -25_000,
        },
        interpretacion: {
          estadoCosto: 'sobre_presupuesto',
          estadoCronograma: 'atrasado',
        },
        estadoGeneral: 'critico',
      });
    });

    it('returns a null cpi/estadoCosto/estadoGeneral when the actual cost is zero (edge case)', async () => {
      const created = await request(app.getHttpServer())
        .post(`/proyectos/${proyecto.id}/actividades`)
        .send({ ...DATOS_VALIDOS, porcentajeAvanceReal: 0, costoReal: 0 });
      const createdBody = created.body as ActivityResponseBody;

      const response = await request(app.getHttpServer())
        .get(`/actividades/${createdBody.id}/analisis-evm`)
        .expect(200);

      const body = response.body as ActivityEvmAnalysisResponseBody;
      expect(body.indicadores.cpi).toBeNull();
      expect(body.indicadores.eac).toBeNull();
      expect(body.interpretacion.estadoCosto).toBeNull();
      expect(body.estadoGeneral).toBeNull();
    });

    it('returns 404 with the uniform error contract when the activity does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get(`/actividades/${VALID_BUT_NON_EXISTENT_ID}/analisis-evm`)
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
        .get('/actividades/not-a-uuid/analisis-evm')
        .expect(400);
    });
  });
});
