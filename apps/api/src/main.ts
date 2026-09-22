import 'reflect-metadata';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { validateEnvironment } from './config.js';

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) return;
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT = '5432', DB_NAME = 's3staffing' } = process.env;
  if (DB_USER && DB_PASSWORD && DB_HOST) {
    process.env.DATABASE_URL = `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public&sslmode=require`;
  }
}

async function bootstrap() {
  ensureDatabaseUrl();
  validateEnvironment(process.env);
  const adapter = new FastifyAdapter({ logger: true, trustProxy: true, bodyLimit: Number(process.env.MAX_RESUME_BYTES ?? 5_242_880) + 1_000_000 });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(multipart, { limits: { fileSize: Number(process.env.MAX_RESUME_BYTES ?? 5_242_880), files: 1, fields: 20 } });
  app.setGlobalPrefix('api/v1');
  const origins = (process.env.WEB_ORIGIN ?? 'http://localhost:3000').split(',').map((origin) => origin.trim());
  app.enableCors(origins.includes('*') ? { origin: true, credentials: false } : { origin: origins, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.enableShutdownHooks();

  const swagger = new DocumentBuilder().setTitle('S3 Staffing API').setDescription('Jobs, applications, employer requests, and administration').setVersion('2.0').addBearerAuth().build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));
  await app.listen(Number(process.env.PORT ?? 4000), '0.0.0.0');
}

void bootstrap();
