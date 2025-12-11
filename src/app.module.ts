import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/all-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketModule } from './websocket/websocket.module';

import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { configurationSchema } from './config/config.validation';

@Module({
  imports: [
    WebsocketModule,
    // ThrottlerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => [
    //     {
    //       ttl: configService.get<number>('throttle.ttl', 60),
    //       limit: configService.get<number>('throttle.limit', 10),
    //     },
    //   ],
    // }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configurationSchema,
    }),
  ],
  controllers: [AppController],
  providers: [
    // { provide: APP_GUARD, useClass: ThrottlerGuard },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    AppService,
  ],
})
export class AppModule {}
