import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Twitter accounts table (for multi-account support)
export const twitterAccounts = pgTable("twitter_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  twitterId: text("twitter_id").notNull(),
  twitterUsername: text("twitter_username").notNull(),
  accountName: text("account_name").notNull(), // Friendly name for the account
  profileImageUrl: text("profile_image_url"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  isDefault: boolean("is_default").default(false), // Is this the default account
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTwitterAccountSchema = createInsertSchema(twitterAccounts).pick({
  userId: true,
  twitterId: true, 
  twitterUsername: true,
  accountName: true,
  profileImageUrl: true,
  accessToken: true,
  refreshToken: true,
  tokenExpiry: true,
  isDefault: true,
});

// Twitter posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  twitterAccountId: integer("twitter_account_id").references(() => twitterAccounts.id), // Account specifico collegato al post
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  twitterId: text("twitter_id"),
  scheduledFor: timestamp("scheduled_for"),
  published: boolean("published").default(false),
  aiGenerated: boolean("ai_generated").default(false),
  engagement: json("engagement"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  twitterAccountId: true,
  content: true,
  imageUrl: true,
  scheduledFor: true,
  aiGenerated: true,
});

// Crypto trading calls table
export const tradingCalls = pgTable("trading_calls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  asset: text("asset").notNull(),
  position: text("position").notNull(), // LONG or SHORT
  entryPrice: text("entry_price").notNull(),
  targetPrice: text("target_price").notNull(),
  currentPrice: text("current_price"),
  profitLoss: text("profit_loss"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  status: text("status").default("ACTIVE"),
  postId: integer("post_id").references(() => posts.id),
});

export const insertTradingCallSchema = createInsertSchema(tradingCalls).pick({
  userId: true,
  asset: true, 
  position: true,
  entryPrice: true,
  targetPrice: true,
  currentPrice: true,
  status: true,
});

// Activity metrics table
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  followers: integer("followers"),
  engagement: integer("engagement"),
  impressions: integer("impressions"),
  aiEfficiency: integer("ai_efficiency"),
  date: timestamp("date").defaultNow(),
});

export const insertMetricsSchema = createInsertSchema(metrics).pick({
  userId: true,
  followers: true,
  engagement: true,
  impressions: true,
  aiEfficiency: true
});

// AI generated content ideas
export const contentIdeas = pgTable("content_ideas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  type: text("type").notNull(), // tweet, thread, meme, etc.
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentIdeaSchema = createInsertSchema(contentIdeas).pick({
  userId: true,
  content: true,
  type: true,
});

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  twitterAccounts: many(twitterAccounts),
  posts: many(posts),
  tradingCalls: many(tradingCalls),
  metrics: many(metrics),
  contentIdeas: many(contentIdeas),
}));

export const twitterAccountsRelations = relations(twitterAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [twitterAccounts.userId],
    references: [users.id],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  twitterAccount: one(twitterAccounts, {
    fields: [posts.twitterAccountId],
    references: [twitterAccounts.id],
  }),
  tradingCall: one(tradingCalls, {
    fields: [posts.id],
    references: [tradingCalls.postId],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TwitterAccount = typeof twitterAccounts.$inferSelect;
export type InsertTwitterAccount = z.infer<typeof insertTwitterAccountSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type TradingCall = typeof tradingCalls.$inferSelect;
export type InsertTradingCall = z.infer<typeof insertTradingCallSchema>;

export type Metrics = typeof metrics.$inferSelect;
export type InsertMetrics = z.infer<typeof insertMetricsSchema>;

export type ContentIdea = typeof contentIdeas.$inferSelect;
export type InsertContentIdea = z.infer<typeof insertContentIdeaSchema>;
