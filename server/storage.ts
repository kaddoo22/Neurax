import { 
  users, type User, type InsertUser,
  posts, type Post, type InsertPost,
  tradingCalls, type TradingCall, type InsertTradingCall,
  metrics, type Metrics, type InsertMetrics,
  contentIdeas, type ContentIdea, type InsertContentIdea
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTwitterCredentials(id: number, twitterData: Partial<User>): Promise<User | undefined>;
  
  // Posts methods
  createPost(post: InsertPost): Promise<Post>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  getScheduledPosts(userId: number): Promise<Post[]>;
  updatePost(id: number, data: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Trading calls methods
  createTradingCall(call: InsertTradingCall): Promise<TradingCall>;
  getTradingCallsByUserId(userId: number): Promise<TradingCall[]>;
  updateTradingCall(id: number, data: Partial<TradingCall>): Promise<TradingCall | undefined>;
  closeTradingCall(id: number, currentPrice: string, profitLoss: string): Promise<TradingCall | undefined>;
  
  // Metrics methods
  saveMetrics(metrics: InsertMetrics): Promise<Metrics>;
  getLatestMetrics(userId: number): Promise<Metrics | undefined>;
  
  // Content ideas methods
  saveContentIdea(idea: InsertContentIdea): Promise<ContentIdea>;
  getUnusedContentIdeas(userId: number): Promise<ContentIdea[]>;
  markContentIdeaAsUsed(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private tradingCalls: Map<number, TradingCall>;
  private metricsData: Map<number, Metrics>;
  private contentIdeasData: Map<number, ContentIdea>;
  
  private userCurrentId: number;
  private postCurrentId: number;
  private tradingCallCurrentId: number;
  private metricsCurrentId: number;
  private contentIdeaCurrentId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.tradingCalls = new Map();
    this.metricsData = new Map();
    this.contentIdeasData = new Map();
    
    this.userCurrentId = 1;
    this.postCurrentId = 1;
    this.tradingCallCurrentId = 1;
    this.metricsCurrentId = 1;
    this.contentIdeaCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      twitterConnected: false,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserTwitterCredentials(id: number, twitterData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...twitterData, 
      twitterConnected: true
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Posts methods
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postCurrentId++;
    const now = new Date();
    const post: Post = {
      ...insertPost,
      id,
      published: false,
      createdAt: now
    };
    this.posts.set(id, post);
    return post;
  }
  
  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.userId === userId
    );
  }
  
  async getScheduledPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.userId === userId && post.scheduledFor && !post.published
    );
  }
  
  async updatePost(id: number, data: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...data };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
  
  // Trading calls methods
  async createTradingCall(insertCall: InsertTradingCall): Promise<TradingCall> {
    const id = this.tradingCallCurrentId++;
    const now = new Date();
    const call: TradingCall = {
      ...insertCall,
      id,
      startDate: now,
      status: "ACTIVE"
    };
    this.tradingCalls.set(id, call);
    return call;
  }
  
  async getTradingCallsByUserId(userId: number): Promise<TradingCall[]> {
    return Array.from(this.tradingCalls.values()).filter(
      (call) => call.userId === userId
    );
  }
  
  async updateTradingCall(id: number, data: Partial<TradingCall>): Promise<TradingCall | undefined> {
    const call = this.tradingCalls.get(id);
    if (!call) return undefined;
    
    const updatedCall = { ...call, ...data };
    this.tradingCalls.set(id, updatedCall);
    return updatedCall;
  }
  
  async closeTradingCall(id: number, currentPrice: string, profitLoss: string): Promise<TradingCall | undefined> {
    const call = this.tradingCalls.get(id);
    if (!call) return undefined;
    
    const now = new Date();
    const updatedCall: TradingCall = {
      ...call,
      status: "CLOSED",
      endDate: now,
      currentPrice,
      profitLoss
    };
    
    this.tradingCalls.set(id, updatedCall);
    return updatedCall;
  }
  
  // Metrics methods
  async saveMetrics(insertMetrics: InsertMetrics): Promise<Metrics> {
    const id = this.metricsCurrentId++;
    const now = new Date();
    const metrics: Metrics = {
      ...insertMetrics,
      id,
      date: now
    };
    this.metricsData.set(id, metrics);
    return metrics;
  }
  
  async getLatestMetrics(userId: number): Promise<Metrics | undefined> {
    const userMetrics = Array.from(this.metricsData.values())
      .filter(metric => metric.userId === userId)
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return b.date.getTime() - a.date.getTime();
      });
      
    return userMetrics[0];
  }
  
  // Content ideas methods
  async saveContentIdea(insertIdea: InsertContentIdea): Promise<ContentIdea> {
    const id = this.contentIdeaCurrentId++;
    const now = new Date();
    const idea: ContentIdea = {
      ...insertIdea,
      id,
      used: false,
      createdAt: now
    };
    this.contentIdeasData.set(id, idea);
    return idea;
  }
  
  async getUnusedContentIdeas(userId: number): Promise<ContentIdea[]> {
    return Array.from(this.contentIdeasData.values())
      .filter(idea => idea.userId === userId && !idea.used);
  }
  
  async markContentIdeaAsUsed(id: number): Promise<boolean> {
    const idea = this.contentIdeasData.get(id);
    if (!idea) return false;
    
    this.contentIdeasData.set(id, { ...idea, used: true });
    return true;
  }
}

export const storage = new MemStorage();
