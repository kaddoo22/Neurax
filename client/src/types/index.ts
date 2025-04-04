// WebSocket message base type
export interface WebSocketMessage {
  type: string;
  timestamp: number;
  [key: string]: any;
}

// Types for other application-specific interfaces can be added here