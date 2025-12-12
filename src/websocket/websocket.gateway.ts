import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// Types pour les utilisateurs connectés
export interface ConnectedUser {
  id: number | string;
  name?: string;
  email?: string;
  type: 'client' | 'driver' | 'admin';
}

export interface ConnectionInfo {
  socketId: string;
  userId: number | string;
  user: ConnectedUser;
  rooms: string[];
  connectedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*', // TODO: Restreindre en production
  },
  transports: ['websocket', 'polling'], // websocket en priorité
  pingInterval: 25000, // maintien connexion
  pingTimeout: 60000,
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  // Map des connexions identifiées: socketId -> ConnectionInfo
  private connections: Map<string, ConnectionInfo> = new Map();

  // Connexion d'un client
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // Déconnexion d'un client
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Supprimer de la map des connexions
    this.connections.delete(client.id);
  }

  // Client s'identifie après connexion
  @SubscribeMessage('identify')
  handleIdentify(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number | string; user: ConnectedUser },
  ) {
    const connectionInfo: ConnectionInfo = {
      socketId: client.id,
      userId: data.userId,
      user: data.user,
      rooms: [],
      connectedAt: new Date(),
    };

    this.connections.set(client.id, connectionInfo);
    this.logger.log(
      `Client ${client.id} identified as ${data.user.type}: ${data.userId}`,
    );

    return { success: true, socketId: client.id };
  }

  // Client rejoint une room
  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);

    // Mettre à jour les rooms dans ConnectionInfo
    const connection = this.connections.get(client.id);
    if (connection && !connection.rooms.includes(data.room)) {
      connection.rooms.push(data.room);
    }

    this.logger.log(`Client ${client.id} joined room: ${data.room}`);
    return { success: true, room: data.room };
  }

  // Client quitte une room
  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);

    // Mettre à jour les rooms dans ConnectionInfo
    const connection = this.connections.get(client.id);
    if (connection) {
      connection.rooms = connection.rooms.filter((r) => r !== data.room);
    }

    this.logger.log(`Client ${client.id} left room: ${data.room}`);
    return { success: true, room: data.room };
  }

  // Émettre un event vers une room (appelé par le controller)
  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
    this.logger.log(`Emitted "${event}" to room "${room}"`);
  }

  // Obtenir les stats des rooms
  getRoomsStats() {
    const rooms = this.server.sockets.adapter.rooms;
    const stats: Record<string, number> = {};

    rooms.forEach((sockets, room) => {
      // Ignorer les rooms qui sont des socket IDs
      if (!this.server.sockets.sockets.has(room)) {
        stats[room] = sockets.size;
      }
    });

    return stats;
  }

  // Obtenir toutes les connexions
  getConnections(type?: 'client' | 'driver' | 'admin'): ConnectionInfo[] {
    const allConnections = Array.from(this.connections.values());

    if (type) {
      return allConnections.filter((c) => c.user.type === type);
    }

    return allConnections;
  }

  // Obtenir le nombre de connexions par type
  getConnectionsCount(): {
    total: number;
    clients: number;
    drivers: number;
    admins: number;
  } {
    const all = Array.from(this.connections.values());
    return {
      total: all.length,
      clients: all.filter((c) => c.user.type === 'client').length,
      drivers: all.filter((c) => c.user.type === 'driver').length,
      admins: all.filter((c) => c.user.type === 'admin').length,
    };
  }
}
