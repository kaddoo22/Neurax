// WebSocket message base type
export interface WebSocketMessage {
  type: string;
  timestamp: number;
  [key: string]: any;
}

// User type definition
export interface User {
  id: number;
  username: string;
  email: string;
  twitterConnected: boolean;
  twitterUsername?: string;
  twitterId?: string;
}

// Types for other application-specific interfaces can be added here