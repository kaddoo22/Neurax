import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  twitterConnected: boolean("twitter_connected").default(false),
  twitterUsername: text("twitter_username"),
  twitterId: text("twitter_id"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Twitter posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type TradingCall = typeof tradingCalls.$inferSelect;
export type InsertTradingCall = z.infer<typeof insertTradingCallSchema>;

export type Metrics = typeof metrics.$inferSelect;
export type InsertMetrics = z.infer<typeof insertMetricsSchema>;

export type ContentIdea = typeof contentIdeas.$inferSelect;
export type InsertContentIdea = z.infer<typeof insertContentIdeaSchema>;
