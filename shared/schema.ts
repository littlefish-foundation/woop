import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wooperative model
export const wooperatives = pgTable("wooperatives", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  category: text("category").notNull(),
  charter: text("charter").notNull(),
  proposerShare: integer("proposer_share").notNull().default(70),
  wooperativeShare: integer("wooperative_share").notNull().default(25),
  solidarityShare: integer("solidarity_share").notNull().default(5),
  creatorId: integer("creator_id").notNull(),
  memberCount: integer("member_count").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wooperative membership model
export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wooperativeId: integer("wooperative_id").notNull(),
  role: text("role").notNull().default("member"), // member, coordinator
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Action model
export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  location: text("location"),
  price: integer("price").notNull(), // in ADA
  nftId: text("nft_id"), // Mock NFT ID
  creatorId: integer("creator_id").notNull(),
  wooperativeId: integer("wooperative_id").notNull(),
  purchased: boolean("purchased").default(false),
  purchaserId: integer("purchaser_id"),
  purchasedAt: timestamp("purchased_at"),
  createdAt: timestamp("created_at").defaultNow(),
  proofOfActivity: json("proof_of_activity").default({}).notNull(), // JSON object with proof details
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  avatar: true,
  walletAddress: true,
});

export const insertWooperativeSchema = createInsertSchema(wooperatives).pick({
  name: true,
  description: true,
  image: true,
  category: true,
  charter: true,
  proposerShare: true,
  wooperativeShare: true,
  solidarityShare: true,
  creatorId: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).pick({
  userId: true,
  wooperativeId: true,
  role: true,
});

export const insertActionSchema = createInsertSchema(actions).pick({
  title: true,
  description: true,
  image: true,
  category: true,
  location: true,
  price: true,
  creatorId: true,
  wooperativeId: true,
  proofOfActivity: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWooperative = z.infer<typeof insertWooperativeSchema>;
export type Wooperative = typeof wooperatives.$inferSelect;

export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Membership = typeof memberships.$inferSelect;

export type InsertAction = z.infer<typeof insertActionSchema>;
export type Action = typeof actions.$inferSelect;

// Extended schemas for validation
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;
