import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from '../src/app.module';

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const options = new DocumentBuilder()
    .setTitle('Movie Ticket Booking System API')
    .setDescription('API for managing movie tickets')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);

  const outPath = resolve(__dirname, '..', '..', 'api-json.json');
  writeFileSync(outPath, JSON.stringify(document, null, 2), 'utf8');
  console.log(`✓ Wrote ${outPath} (${JSON.stringify(document).length} bytes)`);

  await app.close();
}

main().catch((err) => {
  console.error('export-openapi failed:', err);
  process.exit(1);
});
