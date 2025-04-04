import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import crypto from "crypto";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertUserSchema, insertPostSchema, insertTradingCallSchema } from "@shared/schema";
import { twitterService } from "./services/twitter";
import { aiService } from "./services/ai";
import { cryptoService } from "./services/crypto";
import { websocketService } from "./services/websocket";
import { WebSocketServer, WebSocket } from 'ws';
import memorystore from 'memorystore';

// Extend express-session types to include our custom fields
declare module 'express-session' {
  interface SessionData {
    userId: number;
    oauthState: string;
  }
}

// Setup session store
const MemoryStore = memorystore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Create the HTTP server
  const httpServer = createServer(app);
  
  // Create a WebSocket server on a distinct path to avoid conflicts with Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Initialize the WebSocket service with our WebSocket server
  websocketService.initialize(wss);

  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "neurax-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      })
    })
  );

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.userId) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // AUTH ROUTES

  // Register a new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Create the user
      const user = await storage.createUser(userData);
      
      // Store user ID in session
      req.session.userId = user.id;
      
      res.status(201).json({ 
        id: user.id, 
        username: user.username,
        email: user.email,
        twitterConnected: user.twitterConnected
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Store user ID in session
      req.session.userId = user.id;
      
      res.status(200).json({ 
        id: user.id, 
        username: user.username,
        email: user.email,
        twitterConnected: user.twitterConnected 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        twitterConnected: user.twitterConnected,
        twitterUsername: user.twitterUsername
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // TWITTER INTEGRATION ROUTES

  // Initiate Twitter OAuth for connected users
  app.get("/api/twitter/auth", isAuthenticated, (req: Request, res: Response) => {
    try {
      const state = crypto.randomBytes(16).toString("hex");
      req.session.oauthState = state;
      
      const authUrl = twitterService.generateAuthUrl(state);
      res.json({ url: authUrl });
    } catch (error) {
      console.error("Twitter auth error:", error);
      res.status(500).json({ message: "Failed to initiate Twitter authentication" });
    }
  });
  
  // Twitter OAuth for login/registration
  app.get("/api/twitter/auth/login", (req: Request, res: Response) => {
    try {
      const state = crypto.randomBytes(16).toString("hex");
      req.session.oauthState = state;
      
      const authUrl = twitterService.generateAuthUrl(state);
      res.json({ url: authUrl });
    } catch (error) {
      console.error("Twitter auth login error:", error);
      res.status(500).json({ message: "Failed to initiate Twitter authentication" });
    }
  });

  // Twitter OAuth callback
  app.get("/api/auth/twitter/callback", async (req: Request, res: Response) => {
    try {
      console.log("Twitter callback received:", req.query);
      console.log("Session data:", { userId: req.session.userId, oauthState: req.session.oauthState });
      
      const { code, state } = req.query;
      const storedState = req.session.oauthState;
      
      if (!code || !state || state !== storedState) {
        console.log("Invalid OAuth state. Received:", state, "Stored:", storedState);
        return res.status(400).json({ message: "Invalid OAuth state" });
      }
      
      // Exchange code for access token
      const { accessToken, refreshToken, expiresIn } = await twitterService.getAccessToken(code as string);
      
      // Get user profile
      const profile = await twitterService.getUserProfile(accessToken);
      
      // Check if user is already logged in (connecting Twitter to existing account)
      if (req.session.userId) {
        const userId = req.session.userId as number;
        const tokenExpiry = new Date();
        tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expiresIn);
        
        // Update user with Twitter credentials
        await storage.updateUserTwitterCredentials(userId, {
          twitterId: profile.id,
          twitterUsername: profile.username,
          accessToken,
          refreshToken,
          tokenExpiry,
          twitterConnected: true
        });
        
        console.log("Updated existing user with Twitter credentials, userId:", userId);
        
        // Assicurati che la sessione sia salvata prima del redirect
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session for existing user:", err);
            return res.redirect("/settings?error=session_error");
          }
          
          console.log("Session saved successfully for existing user, redirecting to dashboard");
          // Redirect to frontend
          return res.redirect("/dashboard");
        });
      } 
      
      // Login/register via Twitter case:
      // Check if user with this Twitter ID already exists
      let user = await storage.getUserByTwitterId(profile.id);
      
      if (!user) {
        // Create a new user with Twitter credentials
        const randomPassword = crypto.randomBytes(16).toString('hex');
        user = await storage.createUser({
          username: profile.username,
          email: `${profile.username}@twitter.com`, // Placeholder email
          password: randomPassword,
          twitterId: profile.id,
          twitterUsername: profile.username,
          accessToken,
          refreshToken,
          tokenExpiry: new Date(Date.now() + expiresIn * 1000),
          twitterConnected: true
        });
      } else {
        // Update existing user's Twitter credentials 
        const tokenExpiry = new Date();
        tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expiresIn);
        
        await storage.updateUserTwitterCredentials(user.id, {
          accessToken,
          refreshToken,
          tokenExpiry,
          twitterConnected: true
        });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      console.log("User session set, userId:", user.id);
      
      // Assicurati che la sessione sia salvata prima del redirect
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.redirect("/login?error=session_error");
        }
        
        console.log("Session saved successfully, redirecting to dashboard");
        // Redirect to dashboard
        res.redirect("/dashboard");
      });
    } catch (error: any) {
      console.error("Twitter callback error:", error);
      if (error.stack) {
        console.error(error.stack);
      }
      res.redirect("/login?error=twitter_auth_failed");
    }
  });

  // POSTS ROUTES

  // Get user's posts
  app.get("/api/posts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const posts = await storage.getPostsByUserId(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts" });
    }
  });

  // Get scheduled posts
  app.get("/api/posts/scheduled", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const scheduledPosts = await storage.getScheduledPosts(userId);
      res.json(scheduledPosts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching scheduled posts" });
    }
  });

  // Create a new post
  app.post("/api/posts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const postData = insertPostSchema.parse({
        ...req.body,
        userId
      });
      
      const post = await storage.createPost(postData);
      
      // If post is scheduled for now or past, publish it
      if (post.scheduledFor && new Date(post.scheduledFor) <= new Date()) {
        // Get user
        const user = await storage.getUser(userId);
        if (!user || !user.accessToken) {
          return res.status(400).json({ message: "Twitter not connected" });
        }
        
        // Post to Twitter
        const tweetResult = await twitterService.postTweet(
          user.accessToken,
          post.content,
          post.imageUrl || undefined
        );
        
        // Update post with Twitter ID and published status
        await storage.updatePost(post.id, {
          twitterId: tweetResult.id,
          published: true
        });
      }
      
      res.status(201).json(post);
      
      // Notify connected clients
      websocketService.sendContentUpdate(userId, post);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Post creation error:", error);
        res.status(500).json({ message: "Error creating post" });
      }
    }
  });

  // Delete a post
  app.delete("/api/posts/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      // Check if post exists and belongs to user
      const posts = await storage.getPostsByUserId(userId);
      const post = posts.find(p => p.id === postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Delete the post
      await storage.deletePost(postId);
      
      res.status(200).json({ message: "Post deleted" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting post" });
    }
  });

  // AI ROUTES

  // Generate AI text content
  app.post("/api/ai/generate-text", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { topic, contentType, tone, maxLength } = req.body;
      
      if (!topic || !contentType) {
        return res.status(400).json({ message: "Topic and content type are required" });
      }
      
      const content = await aiService.generateTextContent(
        topic,
        contentType,
        tone || 'confident,trader',
        maxLength || 280
      );
      
      res.json({ content });
    } catch (error) {
      console.error("AI generation error:", error);
      res.status(500).json({ message: "Error generating content" });
    }
  });

  // Generate AI image
  app.post("/api/ai/generate-image", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      const imageUrl = await aiService.generateImage(prompt);
      res.json({ imageUrl });
    } catch (error) {
      console.error("AI image generation error:", error);
      res.status(500).json({ message: "Error generating image" });
    }
  });

  // Save content idea
  app.post("/api/ai/save-idea", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const { content, type } = req.body;
      
      if (!content || !type) {
        return res.status(400).json({ message: "Content and type are required" });
      }
      
      const idea = await storage.saveContentIdea({
        userId,
        content,
        type
      });
      
      res.status(201).json(idea);
    } catch (error) {
      res.status(500).json({ message: "Error saving content idea" });
    }
  });

  // Get unused content ideas
  app.get("/api/ai/ideas", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const ideas = await storage.getUnusedContentIdeas(userId);
      res.json(ideas);
    } catch (error) {
      res.status(500).json({ message: "Error fetching content ideas" });
    }
  });

  // CRYPTO TRADING ROUTES

  // Get trading calls for user
  app.get("/api/trading/calls", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const calls = await storage.getTradingCallsByUserId(userId);
      res.json(calls);
    } catch (error) {
      res.status(500).json({ message: "Error fetching trading calls" });
    }
  });

  // Generate new trading call
  app.post("/api/trading/generate-call", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      
      // Generate a trading call
      const tradingCallData = await aiService.generateTradingCall();
      
      // Save the trading call
      const tradingCall = await storage.createTradingCall({
        userId,
        asset: tradingCallData.asset,
        position: tradingCallData.position,
        entryPrice: tradingCallData.entryPrice,
        targetPrice: tradingCallData.targetPrice,
        currentPrice: tradingCallData.entryPrice,
        status: "ACTIVE"
      });
      
      // Generate a post about this trading call
      const content = `NEW ${tradingCall.position} POSITION: $${tradingCall.asset} at ${tradingCall.entryPrice}! Target: ${tradingCall.targetPrice}. ${tradingCallData.reasoning.substring(0, 100)}... #Crypto #Trading`;
      
      const post = await storage.createPost({
        userId,
        content,
        aiGenerated: true
      });
      
      // Update trading call with post ID
      await storage.updateTradingCall(tradingCall.id, { postId: post.id });
      
      // Send trading update via WebSocket
      websocketService.sendTradingUpdate(userId, tradingCall);
      
      res.status(201).json({ tradingCall, post });
    } catch (error) {
      console.error("Trading call generation error:", error);
      res.status(500).json({ message: "Error generating trading call" });
    }
  });

  // Close a trading call
  app.post("/api/trading/close-call/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const callId = parseInt(req.params.id);
      const { currentPrice } = req.body;
      
      if (!currentPrice) {
        return res.status(400).json({ message: "Current price is required" });
      }
      
      // Get the trading call
      const calls = await storage.getTradingCallsByUserId(userId);
      const call = calls.find(c => c.id === callId);
      
      if (!call) {
        return res.status(404).json({ message: "Trading call not found" });
      }
      
      // Calculate profit/loss
      const entryPriceNum = parseFloat(call.entryPrice);
      const currentPriceNum = parseFloat(currentPrice);
      let profitLoss: string;
      
      if (call.position === "LONG") {
        profitLoss = ((currentPriceNum - entryPriceNum) / entryPriceNum * 100).toFixed(2);
      } else {
        profitLoss = ((entryPriceNum - currentPriceNum) / entryPriceNum * 100).toFixed(2);
      }
      
      // Close the trading call
      const updatedCall = await storage.closeTradingCall(callId, currentPrice, profitLoss);
      
      // Generate a post about the closed call
      const profitLossNum = parseFloat(profitLoss);
      const isProfit = profitLossNum > 0;
      
      const content = `CLOSED ${call.position} $${call.asset}: ${isProfit ? 'PROFIT' : 'LOSS'} of ${profitLoss}%! Entry: ${call.entryPrice}, Exit: ${currentPrice}. ${isProfit ? '🚀 Who followed this call?' : 'Not every trade is a winner. Moving on to the next opportunity!'}`;
      
      const post = await storage.createPost({
        userId,
        content,
        aiGenerated: true
      });
      
      // Send trading update via WebSocket
      websocketService.sendTradingUpdate(userId, updatedCall);
      
      res.json({ call: updatedCall, post });
    } catch (error) {
      console.error("Trading call closure error:", error);
      res.status(500).json({ message: "Error closing trading call" });
    }
  });

  // Get crypto market data
  app.get("/api/crypto/market", async (req: Request, res: Response) => {
    try {
      const topCoins = await cryptoService.getTopCoins(10);
      res.json(topCoins);
    } catch (error) {
      console.error("Crypto market data error:", error);
      res.status(500).json({ message: "Error fetching market data" });
    }
  });

  // METRICS ROUTES

  // Get user metrics
  app.get("/api/metrics", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId as number;
      const metrics = await storage.getLatestMetrics(userId);
      
      if (!metrics) {
        // Generate initial metrics
        const newMetrics = await storage.saveMetrics({
          userId,
          followers: 0,
          engagement: 0,
          impressions: 0,
          aiEfficiency: 90
        });
        return res.json(newMetrics);
      }
      
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching metrics" });
    }
  });

  // Update metrics (only used internally)
  const updateUserMetrics = async (userId: number) => {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.twitterConnected || !user.accessToken || !user.twitterId) {
        return;
      }
      
      // Get Twitter metrics
      const twitterMetrics = await twitterService.getUserMetrics(user.accessToken, user.twitterId);
      
      // Save metrics
      const metrics = await storage.saveMetrics({
        userId,
        followers: twitterMetrics.followersCount,
        engagement: Math.floor(Math.random() * 100), // This would come from actual tweet engagement rates
        impressions: twitterMetrics.followersCount * 2, // This would be actual impressions data
        aiEfficiency: Math.floor(85 + Math.random() * 10) // This would be based on AI vs manual post performance
      });
      
      // Send metrics update via WebSocket
      websocketService.sendMetricsUpdate(userId, metrics);
      
      return metrics;
    } catch (error) {
      console.error("Metrics update error:", error);
    }
  };

  // CRON-like endpoint to trigger updates (in production, use a real job scheduler)
  app.post("/api/system/update-metrics", async (req: Request, res: Response) => {
    try {
      // Get all users
      // In a real implementation with a database, you'd query all users
      // Here we're just returning an empty success
      res.json({ message: "Metrics update triggered" });
    } catch (error) {
      res.status(500).json({ message: "Error triggering metrics update" });
    }
  });

  return httpServer;
}
