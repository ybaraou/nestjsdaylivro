import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';

// DTO pour l'émission d'events
class EmitDto {
  room: string;
  event: string;
  data: any;
}

@Controller('ws')
export class WebsocketController {
  constructor(private readonly websocketGateway: WebsocketGateway) {}

  /**
   * Endpoint pour Laravel
   * POST /ws/emit
   * Body: { room: "driver-locations", event: "new-order", data: {...} }
   */
  @Post('emit')
  emit(@Body() body: EmitDto) {
    this.websocketGateway.emitToRoom(body.room, body.event, body.data);
    return { success: true, room: body.room, event: body.event };
  }

  /**
   * Stats des rooms connectées
   * GET /ws/stats
   */
  @Get('stats')
  getStats() {
    return {
      rooms: this.websocketGateway.getRoomsStats(),
      connections: this.websocketGateway.getConnectionsCount(),
    };
  }

  /**
   * Liste des utilisateurs connectés
   * GET /ws/connections
   * GET /ws/connections?type=driver
   * GET /ws/connections?type=client
   * GET /ws/connections?type=admin
   */
  @Get('connections')
  getConnections(@Query('type') type?: 'client' | 'driver' | 'admin') {
    const connections = this.websocketGateway.getConnections(type);
    return {
      total: connections.length,
      type: type || 'all',
      connections,
    };
  }
}
