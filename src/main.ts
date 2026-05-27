import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Movie Ticket Booking System')
    .setDescription('Documentación de las rutas del backend')
    .setVersion('1.0')
    .addBearerAuth() // Para la autenticacion por JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 'api' será la ruta en el navegador (ej: http://localhost:3001/api)
  SwaggerModule.setup('api', app, document);

  // Primero revisa si existe un PORT en el .env y si no hay entonces toma el puerto 3001
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
