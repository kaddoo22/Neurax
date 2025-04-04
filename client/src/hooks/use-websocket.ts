import { useState, useEffect, useCallback, useRef } from "react";
import { WebSocketMessage } from "@/types";
import { Post, TradingCall, Metrics } from "@shared/schema";

// Define message types for better type safety
type ContentUpdateMessage = WebSocketMessage & {
  type: "content_update";
  userId: number;
  content: Post;
  timestamp: number;
};

type TradingUpdateMessage = WebSocketMessage & {
  type: "trading_update";
  userId: number;
  tradingCall: TradingCall;
  timestamp: number;
};

type MetricsUpdateMessage = WebSocketMessage & {
  type: "metrics_update";
  userId: number;
  metrics: Metrics;
  timestamp: number;
};

type ConnectionMessage = WebSocketMessage & {
  type: "connection";
  status: "connected";
  clientId: string;
  timestamp: number;
};

type PongMessage = WebSocketMessage & {
  type: "pong";
  timestamp: number;
};

type SubscribedMessage = WebSocketMessage & {
  type: "subscribed";
  topic: string;
  timestamp: number;
};

type UnsubscribedMessage = WebSocketMessage & {
  type: "unsubscribed";
  topic: string;
  timestamp: number;
};

// Union of all possible message types
type ServerMessage = 
  | ContentUpdateMessage
  | TradingUpdateMessage
  | MetricsUpdateMessage
  | ConnectionMessage
  | PongMessage
  | SubscribedMessage
  | UnsubscribedMessage;

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);
  const [lastError, setLastError] = useState<Event | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const messageHandlersRef = useRef<Map<string, ((data: any) => void)[]>>(new Map());
  
  // Generate a client ID for this session
  const clientIdRef = useRef<string>(
    `client-${Math.random().toString(36).substring(2, 11)}`
  );

  // Connect to the WebSocket server
  const connect = useCallback(() => {
    // Close any existing socket
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
    }

    // Create the WebSocket URL with proper protocol based on page protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?clientId=${clientIdRef.current}`;
    
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setLastError(null);
      
      // Send an initial ping
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
      }
    };

    socket.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      
      try {
        const data = JSON.parse(event.data) as ServerMessage;
        setLastMessage(data);
        
        // Handle connection confirmation
        if (data.type === "connection" && data.status === "connected") {
          setClientId(data.clientId);
        }
        
        // Respond to pong with a ping to keep connection alive
        if (data.type === "pong") {
          // Send a ping every 30 seconds
          setTimeout(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
            }
          }, 30000);
        }
        
        // Dispatch to topic handlers
        if ('topic' in data && data.topic && messageHandlersRef.current.has(data.topic)) {
          const handlers = messageHandlersRef.current.get(data.topic) || [];
          handlers.forEach(handler => handler(data));
        }
        
        // Dispatch to type handlers
        if (messageHandlersRef.current.has(data.type)) {
          const handlers = messageHandlersRef.current.get(data.type) || [];
          handlers.forEach(handler => handler(data));
        }
        
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onclose = (event) => {
      console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
      setIsConnected(false);
      
      // Don't reconnect if the closure was clean
      if (event.wasClean) {
        console.log("WebSocket closed cleanly");
        return;
      }
      
      // Attempt to reconnect after a delay (increasing with each attempt, capped at 10 seconds)
      const delay = Math.min(3000 + Math.floor(Math.random() * 2000), 10000);
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket after ${delay}ms...`);
        connect();
      }, delay);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setLastError(error);
      // Let onclose handle reconnection
    };
  }, []);

  // Connect when component mounts
  useEffect(() => {
    connect();
    
    // Clean up when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Send a message to the WebSocket server
  const sendMessage = useCallback((message: any): boolean => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Subscribe to a topic
  const subscribe = useCallback((topic: string): boolean => {
    return sendMessage({
      type: "subscribe",
      topic
    });
  }, [sendMessage]);
  
  // Unsubscribe from a topic
  const unsubscribe = useCallback((topic: string): boolean => {
    return sendMessage({
      type: "unsubscribe",
      topic
    });
  }, [sendMessage]);
  
  // Add a message handler for a specific topic or message type
  const addMessageHandler = useCallback((key: string, handler: (data: any) => void) => {
    if (!messageHandlersRef.current.has(key)) {
      messageHandlersRef.current.set(key, []);
    }
    messageHandlersRef.current.get(key)?.push(handler);
    
    // Return a function to remove this handler
    return () => {
      const handlers = messageHandlersRef.current.get(key) || [];
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    lastError,
    clientId,
    sendMessage,
    subscribe,
    unsubscribe,
    connect,
    addMessageHandler
  };
}
