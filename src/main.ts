import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const config = new DocumentBuilder()
    .setTitle('API The Movie Ticket Booking System')
    .setDescription('Backend API Routes for The Movie Ticket Booking System')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (document.paths) {
    Object.keys(document.paths).forEach((path) => {
      const methods = document.paths[path];
      Object.keys(methods).forEach((method) => {
        if (!methods[method].responses) {
          methods[method].responses = {};
        }
        methods[method].responses['500'] = {
          description: 'Error interno del servidor. Ocurrió un error inesperado al procesar la solicitud.',
        };
      });
    });
  }

  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();