import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import crypto from 'crypto';

// WebSocket service for real-time updates
export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private topics: Map<string, Set<string>> = new Map(); // Map of topics to client IDs

  // Initialize the WebSocket server
  initialize(server: WebSocketServer | Server): void {
    // If server is a WebSocketServer, use it directly
    if (server instanceof WebSocketServer) {
      this.wss = server;
      console.log('Using provided WebSocketServer instance');
    } else {
      // Otherwise, create a new WebSocketServer with the HTTP server
      this.wss = new WebSocketServer({ server, path: '/ws' });
      console.log('Created new WebSocketServer instance');

      // Set up connection handling if we created the server
      this.setupConnectionHandling();
    }

    console.log('WebSocket service initialized');
  }

  // Setup connection handling if needed
  private setupConnectionHandling(): void {
    if (!this.wss) return;

    this.wss.on('connection', (ws, req) => {
      // Extract clientId from URL or generate a new one
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const clientId = url.searchParams.get('clientId') || crypto.randomUUID();
      
      this.registerClient(clientId, ws);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(clientId, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.removeClient(clientId);
      });

      // Send initial connection confirmation
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        clientId,
        timestamp: Date.now()
      }));
    });
  }
  
  // Register a client with the service
  registerClient(clientId: string, ws: WebSocket): void {
    this.clients.set(clientId, ws);
    console.log(`WebSocket client registered: ${clientId}`);
  }
  
  // Remove a client and clean up subscriptions
  removeClient(clientId: string): void {
    // Remove client from all topics
    Array.from(this.topics.keys()).forEach(topic => {
      const clients = this.topics.get(topic);
      if (clients) {
        clients.delete(clientId);
        if (clients.size === 0) {
          this.topics.delete(topic);
        }
      }
    });
    
    this.clients.delete(clientId);
    console.log(`WebSocket client removed: ${clientId}`);
  }
  
  // Subscribe a client to a topic
  subscribe(clientId: string, topic: string): void {
    // Create topic set if it doesn't exist
    if (!this.topics.has(topic)) {
      this.topics.set(topic, new Set());
    }
    
    // Add client to topic
    const topicClients = this.topics.get(topic);
    topicClients?.add(clientId);
    
    console.log(`Client ${clientId} subscribed to ${topic}`);
  }
  
  // Unsubscribe a client from a topic
  unsubscribe(clientId: string, topic: string): void {
    if (this.topics.has(topic)) {
      const topicClients = this.topics.get(topic);
      topicClients?.delete(clientId);
      
      // Remove topic if no clients remaining
      if (topicClients?.size === 0) {
        this.topics.delete(topic);
      }
      
      console.log(`Client ${clientId} unsubscribed from ${topic}`);
    }
  }

  // Handle incoming WebSocket messages
  private handleMessage(clientId: string, data: any): void {
    console.log(`Received message from ${clientId}:`, data);
    
    // Handle different message types
    switch (data.type) {
      case 'ping':
        this.sendToClient(clientId, {
          type: 'pong',
          timestamp: Date.now(),
        });
        break;
      
      case 'subscribe':
        // Handle subscription to topics
        if (data.topic) {
          // Create topic set if it doesn't exist
          if (!this.topics.has(data.topic)) {
            this.topics.set(data.topic, new Set());
          }
          
          // Add client to topic
          const topicClients = this.topics.get(data.topic);
          topicClients?.add(clientId);
          
          console.log(`Client ${clientId} subscribed to ${data.topic}`);
          
          // Confirm subscription
          this.sendToClient(clientId, {
            type: 'subscribed',
            topic: data.topic,
            timestamp: Date.now(),
          });
        }
        break;
      
      case 'unsubscribe':
        // Handle unsubscription from topics
        if (data.topic && this.topics.has(data.topic)) {
          const topicClients = this.topics.get(data.topic);
          topicClients?.delete(clientId);
          
          // Remove topic if no clients remaining
          if (topicClients?.size === 0) {
            this.topics.delete(data.topic);
          }
          
          console.log(`Client ${clientId} unsubscribed from ${data.topic}`);
          
          // Confirm unsubscription
          this.sendToClient(clientId, {
            type: 'unsubscribed',
            topic: data.topic,
            timestamp: Date.now(),
          });
        }
        break;
      
      default:
        console.log(`Unknown message type: ${data.type}`);
    }
  }

  // Send message to a specific client
  sendToClient(clientId: string, data: any): boolean {
    const client = this.clients.get(clientId);
    
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
      return true;
    }
    
    return false;
  }

  // Broadcast message to all clients
  broadcast(data: any, excludeClientId?: string): void {
    // Use a manual approach to avoid iterator issues
    const clientIds = Array.from(this.clients.keys());
    
    clientIds.forEach(clientId => {
      if (excludeClientId && clientId === excludeClientId) return;
      
      const client = this.clients.get(clientId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Broadcast message to clients subscribed to a topic
  broadcastToTopic(topic: string, data: any): void {
    const subscribers = this.topics.get(topic);
    
    if (!subscribers || subscribers.size === 0) {
      // No subscribers for this topic, fallback to broadcasting to all
      console.log(`No subscribers for topic: ${topic}, broadcasting to all`);
      this.broadcast({
        ...data,
        topic,
      });
      return;
    }
    
    // Send message to all subscribers
    let sentCount = 0;
    subscribers.forEach(clientId => {
      const client = this.clients.get(clientId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          ...data,
          topic,
        }));
        sentCount++;
      }
    });
    
    console.log(`Broadcast message to ${sentCount} subscribers of topic: ${topic}`);
  }

  // Send update about new content being created
  sendContentUpdate(userId: number, content: any): void {
    const data = {
      type: 'content_update',
      userId,
      content,
      timestamp: Date.now(),
    };
    
    // Broadcast to user-specific topic and content topic
    this.broadcastToTopic(`user-${userId}`, data);
    this.broadcastToTopic('content', data);
  }

  // Send trading call update
  sendTradingUpdate(userId: number, tradingCall: any): void {
    const data = {
      type: 'trading_update',
      userId,
      tradingCall,
      timestamp: Date.now(),
    };
    
    // Broadcast to user-specific topic and trading topic
    this.broadcastToTopic(`user-${userId}`, data);
    this.broadcastToTopic('trading', data);
  }

  // Send metrics update
  sendMetricsUpdate(userId: number, metrics: any): void {
    const data = {
      type: 'metrics_update',
      userId,
      metrics,
      timestamp: Date.now(),
    };
    
    // Broadcast to user-specific topic and metrics topic
    this.broadcastToTopic(`user-${userId}`, data);
    this.broadcastToTopic('metrics', data);
  }
}

export const websocketService = new WebSocketService();
