import { Controller, Post, Body, Get, Query, Logger, BadRequestException } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';

// DTO pour l'émission d'events
class EmitDto {
  room?: string;
  event: string;
  data: any;
  orderId?: string | number;
  driverId?: string | number;
  targetIds?: (string | number)[]; // IDs spécifiques à notifier
}

@Controller('ws')
export class WebsocketController {
  private readonly logger = new Logger(WebsocketController.name);

  constructor(private readonly websocketGateway: WebsocketGateway) {}

  /**
   * Endpoint amélioré pour Laravel (webhook)
   * POST /ws/emit
   * Body: {
   *   event: "order.state_changed",
   *   data: { orderId: 123, state: "confirmed", ... },
   *   room?: "order-123", // Optionnel, déterminé automatiquement si absent
   *   orderId?: 123, // Pour routing automatique
   *   driverId?: 45, // Pour routing automatique
   *   targetIds?: [45, 67] // Pour notifier des utilisateurs spécifiques
   * }
   */
  @Post('emit')
  emit(@Body() body: EmitDto) {
    // Validation
    if (!body.event || !body.data) {
      throw new BadRequestException('Missing required fields: event, data');
    }

    // Déterminer la room si non spécifiée
    const room = body.room || this.determineRoom(body);

    this.logger.log(`Emitting event "${body.event}" to room "${room}"`);

    // Émettre l'événement avec timestamp
    this.websocketGateway.emitToRoom(room, body.event, {
      ...body.data,
      timestamp: new Date().toISOString(),
    });

    // Si targetIds spécifiés, émettre aussi directement à ces utilisateurs
    if (body.targetIds && body.targetIds.length > 0) {
      this.emitToSpecificUsers(body.targetIds, body.event, body.data);
    }

    return {
      success: true,
      event: body.event,
      room,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Déterminer automatiquement la room selon les paramètres
   */
  private determineRoom(body: EmitDto): string {
    // Si orderId fourni
    if (body.orderId) {
      return `order-${body.orderId}`;
    }

    // Si driverId fourni
    if (body.driverId) {
      return `driver-${body.driverId}`;
    }

    // Logique de routing automatique selon l'événement
    if (body.event.startsWith('order.')) {
      const orderId = body.data.orderId || body.data.order_id || body.data.id;
      if (orderId) return `order-${orderId}`;
    }

    if (body.event.startsWith('driver.')) {
      const driverId = body.data.driverId || body.data.driver_id || body.data.id;
      if (driverId) return `driver-${driverId}`;
    }

    if (body.event === 'driver.location') {
      return 'driver-locations';
    }

    // Room par défaut
    return 'general';
  }

  /**
   * Émettre à des utilisateurs spécifiques
   */
  private emitToSpecificUsers(userIds: (number | string)[], event: string, data: any) {
    const connections = this.websocketGateway.getConnections();

    let count = 0;
    connections.forEach((connection) => {
      if (userIds.includes(connection.userId)) {
        this.websocketGateway.server.to(connection.socketId).emit(event, data);
        count++;
      }
    });

    this.logger.log(`Emitted "${event}" to ${count} specific users`);
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
