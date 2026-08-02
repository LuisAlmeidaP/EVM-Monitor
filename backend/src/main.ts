import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './infrastructure/filters/global-exception.filter';

const API_DOCS_PATH = 'api-docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  });
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EVM Monitor API')
    .setDescription(
      'API para la gestión de proyectos y actividades, y el cálculo de indicadores de Valor ' +
        'Ganado (Earned Value Management). Todas las respuestas de error siguen un contrato ' +
        'uniforme: { categoria, mensaje, referencia, detalles? }.',
    )
    .setVersion('1.0')
    .addTag(
      'Proyectos',
      'Alta, consulta, actualización y eliminación de proyectos.',
    )
    .addTag(
      'Actividades',
      'Alta, consulta, actualización y eliminación de actividades de un proyecto.',
    )
    .addTag(
      'Análisis EVM',
      'Cálculo de indicadores de Valor Ganado por actividad y consolidados por proyecto.',
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(API_DOCS_PATH, app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
