import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

export class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedClients: Set<string> = new Set();

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      this.connectedClients.add(socket.id);
      logger.info(`WebSocket client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        this.connectedClients.delete(socket.id);
        logger.info(`WebSocket client disconnected: ${socket.id}`);
      });

      // Send initial connection confirmation
      socket.emit('connected', { clientId: socket.id });
    });

    logger.info('WebSocket service initialized');
  }

  // Emit events to all connected clients
  broadcastMetricsUpdate(metrics: any) {
    if (this.io) {
      this.io.emit('metrics:update', metrics);
    }
  }

  broadcastDocumentUpdate(document: any) {
    if (this.io) {
      this.io.emit('document:update', document);
    }
  }

  broadcastVisitorUpdate(visitor: any) {
    if (this.io) {
      this.io.emit('visitor:update', visitor);
    }
  }

  broadcastSystemAlert(alert: any) {
    if (this.io) {
      this.io.emit('system:alert', alert);
    }
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

export const websocketService = new WebSocketService();
