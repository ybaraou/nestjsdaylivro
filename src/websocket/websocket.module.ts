import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketController } from './websocket.controller';

@Module({
  imports: [HttpModule],
  providers: [WebsocketGateway],
  controllers: [WebsocketController],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
