import { 
  users, type User, type InsertUser,
  twitterAccounts, type TwitterAccount, type InsertTwitterAccount,
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
  
  // Twitter account methods
  getTwitterAccount(id: number): Promise<TwitterAccount | undefined>;
  getTwitterAccountsByUserId(userId: number): Promise<TwitterAccount[]>;
  getTwitterAccountByTwitterId(twitterId: string): Promise<TwitterAccount | undefined>;
  createTwitterAccount(account: InsertTwitterAccount): Promise<TwitterAccount>;
  updateTwitterAccount(id: number, data: Partial<TwitterAccount>): Promise<TwitterAccount | undefined>;
  deleteTwitterAccount(id: number): Promise<boolean>;
  setDefaultTwitterAccount(userId: number, accountId: number): Promise<boolean>;
  getDefaultTwitterAccount(userId: number): Promise<TwitterAccount | undefined>;
  
  // Posts methods
  createPost(post: InsertPost): Promise<Post>;
  getPostsByUserId(userId: number, twitterAccountId?: number): Promise<Post[]>;
  getScheduledPosts(userId: number, twitterAccountId?: number): Promise<Post[]>;
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
  private twitterAccounts: Map<number, TwitterAccount>;
  private posts: Map<number, Post>;
  private tradingCalls: Map<number, TradingCall>;
  private metricsData: Map<number, Metrics>;
  private contentIdeasData: Map<number, ContentIdea>;
  
  private userCurrentId: number;
  private twitterAccountCurrentId: number;
  private postCurrentId: number;
  private tradingCallCurrentId: number;
  private metricsCurrentId: number;
  private contentIdeaCurrentId: number;

  constructor() {
    this.users = new Map();
    this.twitterAccounts = new Map();
    this.posts = new Map();
    this.tradingCalls = new Map();
    this.metricsData = new Map();
    this.contentIdeasData = new Map();
    
    this.userCurrentId = 1;
    this.twitterAccountCurrentId = 1;
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
  
  // Helper method per trovare un utente tramite ID Twitter
  async getUserByTwitterId(twitterId: string): Promise<User | undefined> {
    // Trova un account Twitter con questo ID
    const twitterAccount = await this.getTwitterAccountByTwitterId(twitterId);
    if (!twitterAccount) return undefined;
    
    // Trova l'utente associato
    return this.getUser(twitterAccount.userId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Twitter account methods
  async getTwitterAccount(id: number): Promise<TwitterAccount | undefined> {
    return this.twitterAccounts.get(id);
  }
  
  async getTwitterAccountsByUserId(userId: number): Promise<TwitterAccount[]> {
    return Array.from(this.twitterAccounts.values()).filter(
      (account) => account.userId === userId
    );
  }
  
  async getTwitterAccountByTwitterId(twitterId: string): Promise<TwitterAccount | undefined> {
    return Array.from(this.twitterAccounts.values()).find(
      (account) => account.twitterId === twitterId
    );
  }
  
  async createTwitterAccount(insertAccount: InsertTwitterAccount): Promise<TwitterAccount> {
    const id = this.twitterAccountCurrentId++;
    const now = new Date();
    
    // Se è il primo account di questo utente, impostiamo isDefault a true
    let isDefault = insertAccount.isDefault;
    if (!isDefault) {
      const userAccounts = await this.getTwitterAccountsByUserId(insertAccount.userId);
      if (userAccounts.length === 0) {
        isDefault = true;
      }
    }
    
    const account: TwitterAccount = {
      ...insertAccount,
      id,
      isDefault: isDefault ?? false,
      profileImageUrl: insertAccount.profileImageUrl || null,
      accessToken: insertAccount.accessToken || null,
      accessTokenSecret: insertAccount.accessTokenSecret || null, // Aggiunto per OAuth 1.0a
      refreshToken: insertAccount.refreshToken || null,
      tokenExpiry: insertAccount.tokenExpiry || null,
      createdAt: now
    };
    
    this.twitterAccounts.set(id, account);
    return account;
  }
  
  async updateTwitterAccount(id: number, data: Partial<TwitterAccount>): Promise<TwitterAccount | undefined> {
    const account = this.twitterAccounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...data };
    this.twitterAccounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteTwitterAccount(id: number): Promise<boolean> {
    const account = this.twitterAccounts.get(id);
    if (!account) return false;
    
    // Se eliminiamo l'account predefinito e ci sono altri account per questo utente, 
    // impostiamo un altro account come predefinito
    if (account.isDefault) {
      const userAccounts = await this.getTwitterAccountsByUserId(account.userId);
      const otherAccount = userAccounts.find(a => a.id !== id);
      if (otherAccount) {
        await this.updateTwitterAccount(otherAccount.id, { isDefault: true });
      }
    }
    
    return this.twitterAccounts.delete(id);
  }
  
  async setDefaultTwitterAccount(userId: number, accountId: number): Promise<boolean> {
    // Rimuovi l'impostazione predefinita da tutti gli account dell'utente
    const userAccounts = await this.getTwitterAccountsByUserId(userId);
    for (const account of userAccounts) {
      if (account.isDefault) {
        await this.updateTwitterAccount(account.id, { isDefault: false });
      }
    }
    
    // Imposta l'account selezionato come predefinito
    const account = this.twitterAccounts.get(accountId);
    if (!account || account.userId !== userId) return false;
    
    await this.updateTwitterAccount(accountId, { isDefault: true });
    return true;
  }
  
  async getDefaultTwitterAccount(userId: number): Promise<TwitterAccount | undefined> {
    const userAccounts = await this.getTwitterAccountsByUserId(userId);
    return userAccounts.find(account => account.isDefault);
  }
  
  // Posts methods
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postCurrentId++;
    const now = new Date();
    const post: Post = {
      ...insertPost,
      id,
      published: false,
      twitterId: null,
      twitterAccountId: insertPost.twitterAccountId || null,
      imageUrl: insertPost.imageUrl || null,
      scheduledFor: insertPost.scheduledFor || null,
      aiGenerated: insertPost.aiGenerated || null,
      engagement: null,
      createdAt: now
    };
    this.posts.set(id, post);
    return post;
  }
  
  async getPostsByUserId(userId: number, twitterAccountId?: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.userId === userId && 
        (twitterAccountId === undefined || post.twitterAccountId === twitterAccountId)
    );
  }
  
  async getScheduledPosts(userId: number, twitterAccountId?: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.userId === userId && 
        post.scheduledFor && 
        !post.published &&
        (twitterAccountId === undefined || post.twitterAccountId === twitterAccountId)
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
      endDate: null,
      currentPrice: insertCall.currentPrice || null,
      profitLoss: null,
      postId: null,
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
      date: now,
      followers: insertMetrics.followers || null,
      engagement: insertMetrics.engagement || null,
      impressions: insertMetrics.impressions || null,
      aiEfficiency: insertMetrics.aiEfficiency || null
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
