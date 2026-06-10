import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config as dotenvConfig } from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  dotenvConfig();
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Movies API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  );

  // Serializar BigInt como string en respuestas JSON
  (BigInt.prototype as unknown as { toJSON: () => string }).toJSON =
    function () {
      return this.toString();
    };

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
