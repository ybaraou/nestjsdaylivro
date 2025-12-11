import { setupSwagger } from './swagger';
import { ValidationError } from 'class-validator';
import { ValidationFilter } from './filters/validation.filter';
import { myValidationError } from './filters/validation.errors';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.use(helmet());

  app.enableCors();

  const configService = app.get(ConfigService);
  app.useGlobalFilters(new ValidationFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      always: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return myValidationError(errors);
      },
    }),
  );
  app.setGlobalPrefix('api/v1');
  setupSwagger(app);
  await app.listen(configService.get<number>('port', 5000));
}
bootstrap();
