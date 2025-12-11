import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketController } from './websocket.controller';

@Module({
  providers: [WebsocketGateway],
  controllers: [WebsocketController],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
