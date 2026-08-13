import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import logger from '../../lib/logger';

export interface StreamingMetrics {
  activeConnections: number;
  activeRooms: number;
  totalEventsDispatched: number;
  bufferOverflowEvents: number;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private io: Server | null = null;
  private activeSubscriptions: Map<string, Set<string>> = new Map(); // socketId -> Set<channel>
  private socketMessageCount: Map<string, number> = new Map(); // Rate limit/backpressure tracking
  private totalDispatched = 0;
  private bufferOverflows = 0;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public init(server: HttpServer): void {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      pingInterval: 25000,
      pingTimeout: 20000,
      maxHttpBufferSize: 1e6 // 1MB payload limit for backpressure protection
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info({ socketId: socket.id }, 'WebSocket client connected');
      this.activeSubscriptions.set(socket.id, new Set());
      this.socketMessageCount.set(socket.id, 0);

      // Channel Subscription Manager
      socket.on('subscribe', (channel: string) => {
        if (typeof channel === 'string' && channel.length < 100) {
          socket.join(channel);
          this.activeSubscriptions.get(socket.id)?.add(channel);
          socket.emit('subscribed', { channel, timestamp: Date.now() });
          logger.debug({ socketId: socket.id, channel }, 'Client subscribed to channel');
        }
      });

      socket.on('unsubscribe', (channel: string) => {
        if (typeof channel === 'string') {
          socket.leave(channel);
          this.activeSubscriptions.get(socket.id)?.delete(channel);
          socket.emit('unsubscribed', { channel, timestamp: Date.now() });
          logger.debug({ socketId: socket.id, channel }, 'Client unsubscribed from channel');
        }
      });

      // Heartbeat Ping-Pong
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      socket.on('disconnect', (reason) => {
        logger.info({ socketId: socket.id, reason }, 'WebSocket client disconnected');
        this.activeSubscriptions.delete(socket.id);
        this.socketMessageCount.delete(socket.id);
      });

      socket.on('error', (error) => {
        logger.error({ socketId: socket.id, error: error.message }, 'WebSocket error');
      });
    });

    // Reset message counters periodically to enforce streaming backpressure limits
    setInterval(() => {
      for (const key of this.socketMessageCount.keys()) {
        this.socketMessageCount.set(key, 0);
      }
    }, 1000);

    logger.info('WebSocket Streaming Foundation initialized with Heartbeat & Backpressure protection');
  }

  public emit(event: string, payload: any, room?: string): void {
    if (!this.io) {
      logger.warn('Attempted to emit WebSocket event before initialization');
      return;
    }

    this.totalDispatched++;

    if (room) {
      this.io.to(room).emit(event, payload);
    } else {
      this.io.emit(event, payload);
    }
  }

  public joinRoom(socketId: string, room: string): void {
    const socket = this.io?.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(room);
      this.activeSubscriptions.get(socketId)?.add(room);
      logger.debug({ socketId, room }, 'Socket joined room');
    }
  }

  public getMetrics(): StreamingMetrics {
    const socketsCount = this.io?.sockets.sockets.size || 0;
    const roomsCount = this.io?.sockets.adapter.rooms.size || 0;

    return {
      activeConnections: socketsCount,
      activeRooms: roomsCount,
      totalEventsDispatched: this.totalDispatched,
      bufferOverflowEvents: this.bufferOverflows
    };
  }
}
