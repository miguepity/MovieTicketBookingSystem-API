import 'dotenv/config';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  // Asegura que exista la carpeta donde se guardan los posters subidos
  mkdirSync(join(process.cwd(), 'uploads', 'posters'), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir los archivos subidos (posters) como archivos estáticos
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Habilitar validaciones globales (elimina campos que no estén en el DTO automáticamente)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: 'http://localhost:5173',
  });

  // Configuración de Swagger para la documentación de la API
  const config = new DocumentBuilder()
    .setTitle('API de Movie Ticket Booking System')
    .setDescription('Documentación de las rutas del backend')
    .setVersion('1.0')
    .addBearerAuth() // Para la autenticación por JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 'api' será la ruta en el navegador (ej: http://localhost:3001/api)
  SwaggerModule.setup('api', app, document);

  // Primero revisa si existe un PORT en el .env y si no hay entonces toma el puerto 3001
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
