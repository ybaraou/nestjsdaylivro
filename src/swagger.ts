import { INestApplication } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { promises } from 'fs';
import { join } from 'path';

export async function setupSwagger(app: INestApplication) {
  /**
   * Configuration for the Swagger-ui-express
   */
  const pkg = JSON.parse(
    await promises.readFile(join('./', 'package.json'), 'utf8'),
  );
  const config = new DocumentBuilder()
    .setTitle('Indi')
    .setDescription('The API documentation from INDI')
    .setVersion(pkg.version)
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      displayOperationId: true,
      displayRequestDuration: true,
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Indi API',
  };
  SwaggerModule.setup('api', app, document, customOptions);
}
