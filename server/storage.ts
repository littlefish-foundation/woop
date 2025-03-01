import { users, wooperatives, memberships, actions } from "@shared/schema";
import type { User, InsertUser, Wooperative, InsertWooperative, Membership, InsertMembership, Action, InsertAction } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and, count, inArray } from "drizzle-orm";
import { Pool } from "@neondatabase/serverless";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(userId: number, walletAddress: string): Promise<User | undefined>;
  
  // Wooperative operations
  getWooperative(id: number): Promise<Wooperative | undefined>;
  getWooperatives(): Promise<Wooperative[]>;
  getWooperativesByUser(userId: number): Promise<Wooperative[]>;
  createWooperative(wooperative: InsertWooperative): Promise<Wooperative>;
  
  // Membership operations
  getMemberships(userId: number): Promise<Membership[]>;
  createMembership(membership: InsertMembership): Promise<Membership>;
  
  // Action operations
  getAction(id: number): Promise<Action | undefined>;
  getActions(): Promise<Action[]>;
  getActionsByWooperative(wooperativeId: number): Promise<Action[]>;
  getActionsByUser(userId: number): Promise<Action[]>;
  createAction(action: InsertAction): Promise<Action>;
  purchaseAction(actionId: number, userId: number): Promise<Action>;

  // Session store
  sessionStore: session.Store;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wooperatives: Map<number, Wooperative>;
  private memberships: Map<number, Membership>;
  private actions: Map<number, Action>;
  
  sessionStore: session.Store;
  currentUserId: number;
  currentWooperativeId: number;
  currentMembershipId: number;
  currentActionId: number;

  constructor() {
    this.users = new Map();
    this.wooperatives = new Map();
    this.memberships = new Map();
    this.actions = new Map();
    
    this.currentUserId = 1;
    this.currentWooperativeId = 1;
    this.currentMembershipId = 1;
    this.currentActionId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Add some sample data
    this.seedData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === address,
    );
  }
  
  async updateUserWallet(userId: number, walletAddress: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    
    if (!user) {
      return undefined;
    }
    
    // Update the user's wallet address
    user.walletAddress = walletAddress;
    this.users.set(userId, user);
    
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async getWooperative(id: number): Promise<Wooperative | undefined> {
    return this.wooperatives.get(id);
  }

  async getWooperatives(): Promise<Wooperative[]> {
    return Array.from(this.wooperatives.values());
  }

  async getWooperativesByUser(userId: number): Promise<Wooperative[]> {
    // Get all memberships for this user
    const userMemberships = await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, userId));

    // If no memberships, return empty array
    if (userMemberships.length === 0) return [];

    // Get all wooperatives for these memberships
    const wooperativeIds = userMemberships.map(m => m.wooperativeId);
    
    if (wooperativeIds.length === 0) return [];
    
    return await db
      .select()
      .from(wooperatives)
      .where(inArray(wooperatives.id, wooperativeIds));
  }

  async createWooperative(insertWooperative: InsertWooperative): Promise<Wooperative> {
    const id = this.currentWooperativeId++;
    const createdAt = new Date();
    const wooperative: Wooperative = { ...insertWooperative, id, createdAt, memberCount: 1 };
    this.wooperatives.set(id, wooperative);
    
    // Create membership for creator
    await this.createMembership({
      userId: insertWooperative.creatorId,
      wooperativeId: id,
      role: "coordinator"
    });
    
    return wooperative;
  }

  async getMemberships(userId: number): Promise<Membership[]> {
    return Array.from(this.memberships.values()).filter(
      (membership) => membership.userId === userId
    );
  }

  async createMembership(insertMembership: InsertMembership): Promise<Membership> {
    const id = this.currentMembershipId++;
    const joinedAt = new Date();
    const membership: Membership = { ...insertMembership, id, joinedAt };
    this.memberships.set(id, membership);
    
    // Update member count
    const wooperative = this.wooperatives.get(insertMembership.wooperativeId);
    if (wooperative) {
      wooperative.memberCount += 1;
      this.wooperatives.set(wooperative.id, wooperative);
    }
    
    return membership;
  }

  async getAction(id: number): Promise<Action | undefined> {
    return this.actions.get(id);
  }

  async getActions(): Promise<Action[]> {
    return Array.from(this.actions.values());
  }

  async getActionsByWooperative(wooperativeId: number): Promise<Action[]> {
    return Array.from(this.actions.values()).filter(
      (action) => action.wooperativeId === wooperativeId
    );
  }

  async getActionsByUser(userId: number): Promise<Action[]> {
    return Array.from(this.actions.values()).filter(
      (action) => action.creatorId === userId
    );
  }

  async createAction(insertAction: InsertAction): Promise<Action> {
    const id = this.currentActionId++;
    const createdAt = new Date();
    const nftId = `NFT-${Math.floor(1000 + Math.random() * 9000)}`; // Mock NFT ID
    
    const action: Action = { 
      ...insertAction, 
      id, 
      createdAt, 
      nftId, 
      purchased: false,
      purchaserId: undefined,
      purchasedAt: undefined
    };
    
    this.actions.set(id, action);
    return action;
  }

  async purchaseAction(actionId: number, userId: number): Promise<Action> {
    const action = this.actions.get(actionId);
    if (!action) {
      throw new Error("Action not found");
    }
    
    action.purchased = true;
    action.purchaserId = userId;
    action.purchasedAt = new Date();
    
    this.actions.set(actionId, action);
    return action;
  }

  // Seed with sample data
  private seedData() {
    // Create sample users
    const user1: User = {
      id: this.currentUserId++,
      username: "jsmith",
      password: "$2b$10$A.1cRY2vyMN2K39yEw5JUOa.5r4rZDGFgImbMkDEwXZ.G39gS7e8K", // "password123"
      name: "John Smith",
      email: "john@example.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      walletAddress: "addr1qxy8p07tr8s70za207wuhq8k2expx5h4kpk4vj2wca9rnfvlh8azrty0jgh9cnyupun5xpfy644kyjy6a5kejcet9cqt2y5yx",
      createdAt: new Date()
    };
    
    const user2: User = {
      id: this.currentUserId++,
      username: "sarah",
      password: "$2b$10$A.1cRY2vyMN2K39yEw5JUOa.5r4rZDGFgImbMkDEwXZ.G39gS7e8K", // "password123"
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80",
      walletAddress: "addr1qx0e458sd9xrt5v3wvrtdqve43aawv0rzlmhk9flpplk52rcmjyd2yvdsccj7muvt2xvj6vvgzvp4ksls5pllvuxa4q2y7n08",
      createdAt: new Date()
    };
    
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    
    // Create sample wooperatives
    const wooperative1: Wooperative = {
      id: this.currentWooperativeId++,
      name: "Ocean Cleanup Initiative",
      description: "Coordinating beach cleanups and marine conservation efforts worldwide through local actions and global impact.",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
      category: "Environmental",
      charter: "We aim to clean up beaches and protect marine life through coordinated actions worldwide.",
      proposerShare: 70,
      wooperativeShare: 25,
      solidarityShare: 5,
      creatorId: user1.id,
      memberCount: 128,
      createdAt: new Date()
    };
    
    const wooperative2: Wooperative = {
      id: this.currentWooperativeId++,
      name: "Local Farmers Support",
      description: "Supporting small-scale sustainable farmers through direct investment, knowledge sharing, and local food initiatives.",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
      category: "Agriculture",
      charter: "We support small-scale farmers to promote sustainable agriculture and food security.",
      proposerShare: 75,
      wooperativeShare: 20,
      solidarityShare: 5,
      creatorId: user2.id,
      memberCount: 97,
      createdAt: new Date()
    };
    
    const wooperative3: Wooperative = {
      id: this.currentWooperativeId++,
      name: "Tech Education Access",
      description: "Breaking down barriers to technology education through mentorship, equipment donations, and community workshops.",
      image: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
      category: "Education",
      charter: "We provide technology education to underserved communities to help bridge the digital divide.",
      proposerShare: 65,
      wooperativeShare: 30,
      solidarityShare: 5,
      creatorId: user1.id,
      memberCount: 145,
      createdAt: new Date()
    };
    
    this.wooperatives.set(wooperative1.id, wooperative1);
    this.wooperatives.set(wooperative2.id, wooperative2);
    this.wooperatives.set(wooperative3.id, wooperative3);
    
    // Create sample memberships
    const membership1: Membership = {
      id: this.currentMembershipId++,
      userId: user1.id,
      wooperativeId: wooperative1.id,
      role: "coordinator",
      joinedAt: new Date()
    };
    
    const membership2: Membership = {
      id: this.currentMembershipId++,
      userId: user1.id,
      wooperativeId: wooperative3.id,
      role: "coordinator",
      joinedAt: new Date()
    };
    
    const membership3: Membership = {
      id: this.currentMembershipId++,
      userId: user2.id,
      wooperativeId: wooperative2.id,
      role: "coordinator",
      joinedAt: new Date()
    };
    
    this.memberships.set(membership1.id, membership1);
    this.memberships.set(membership2.id, membership2);
    this.memberships.set(membership3.id, membership3);
    
    // Create sample actions
    const action1: Action = {
      id: this.currentActionId++,
      title: "Beach Cleanup - 300lbs Removed",
      description: "Organized team of volunteers to remove 300lbs of plastic and debris from Venice Beach shoreline and surrounding areas.",
      image: "https://images.unsplash.com/photo-1547489432-cf93fa6c71ee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
      category: "Environmental",
      location: "Venice Beach, California",
      price: 85,
      nftId: "NFT-2447",
      creatorId: user1.id,
      wooperativeId: wooperative1.id,
      purchased: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      proofOfActivity: { images: ["beach-cleanup-1.jpg", "beach-cleanup-2.jpg"], documents: ["cleanup-report.pdf"] }
    };
    
    const action2: Action = {
      id: this.currentActionId++,
      title: "Community Garden Installation",
      description: "Transformed vacant lot into a productive community garden with 12 raised beds, irrigation system, and compost area.",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
      category: "Agriculture",
      location: "Portland, Oregon",
      price: 120,
      nftId: "NFT-2458",
      creatorId: user2.id,
      wooperativeId: wooperative2.id,
      purchased: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      proofOfActivity: { images: ["garden-1.jpg", "garden-2.jpg"], documents: ["garden-plan.pdf"] }
    };
    
    const action3: Action = {
      id: this.currentActionId++,
      title: "Web Development Workshop",
      description: "Conducted a 2-day coding workshop for 25 disadvantaged students, covering HTML, CSS, and JavaScript fundamentals.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80",
      category: "Education",
      location: "Chicago, Illinois",
      price: 150,
      nftId: "NFT-2409",
      creatorId: user1.id,
      wooperativeId: wooperative3.id,
      purchased: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      proofOfActivity: { images: ["workshop-1.jpg", "workshop-2.jpg"], documents: ["curriculum.pdf"] }
    };
    
    this.actions.set(action1.id, action1);
    this.actions.set(action2.id, action2);
    this.actions.set(action3.id, action3);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    if (!address) return undefined;
    const [user] = await db.select().from(users).where(eq(users.walletAddress, address));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserWallet(userId: number, walletAddress: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ walletAddress })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getWooperative(id: number): Promise<Wooperative | undefined> {
    const [wooperative] = await db.select().from(wooperatives).where(eq(wooperatives.id, id));
    return wooperative || undefined;
  }

  async getWooperatives(): Promise<Wooperative[]> {
    return await db.select().from(wooperatives);
  }

  async getWooperativesByUser(userId: number): Promise<Wooperative[]> {
    // Get all memberships for this user
    const userMemberships = await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, userId));

    // If no memberships, return empty array
    if (userMemberships.length === 0) return [];

    // Get all wooperatives for these memberships
    const wooperativeIds = userMemberships.map(m => m.wooperativeId);
    
    if (wooperativeIds.length === 0) return [];
    
    return await db
      .select()
      .from(wooperatives)
      .where(inArray(wooperatives.id, wooperativeIds));
  }

  async createWooperative(insertWooperative: InsertWooperative): Promise<Wooperative> {
    // Start with member count at 1 for the creator
    const insertData = { ...insertWooperative, memberCount: 1 };
    
    // Create the wooperative
    const [wooperative] = await db
      .insert(wooperatives)
      .values(insertData)
      .returning();
    
    // Create membership for creator
    await this.createMembership({
      userId: insertWooperative.creatorId,
      wooperativeId: wooperative.id,
      role: "coordinator"
    });
    
    return wooperative;
  }

  async getMemberships(userId: number): Promise<Membership[]> {
    return await db
      .select()
      .from(memberships)
      .where(eq(memberships.userId, userId));
  }

  async createMembership(insertMembership: InsertMembership): Promise<Membership> {
    // Create the membership
    const [membership] = await db
      .insert(memberships)
      .values(insertMembership)
      .returning();
    
    // Update the member count for the wooperative
    // First, count the memberships
    const result = await db
      .select({ count: count() })
      .from(memberships)
      .where(eq(memberships.wooperativeId, insertMembership.wooperativeId));
    
    const memberCount = result[0].count;
    
    // Then update the wooperative with the count
    await db
      .update(wooperatives)
      .set({ memberCount })
      .where(eq(wooperatives.id, insertMembership.wooperativeId));
    
    return membership;
  }

  async getAction(id: number): Promise<Action | undefined> {
    const [action] = await db.select().from(actions).where(eq(actions.id, id));
    return action || undefined;
  }

  async getActions(): Promise<Action[]> {
    return await db.select().from(actions);
  }

  async getActionsByWooperative(wooperativeId: number): Promise<Action[]> {
    return await db
      .select()
      .from(actions)
      .where(eq(actions.wooperativeId, wooperativeId));
  }

  async getActionsByUser(userId: number): Promise<Action[]> {
    return await db
      .select()
      .from(actions)
      .where(eq(actions.creatorId, userId));
  }

  async createAction(insertAction: InsertAction): Promise<Action> {
    // Generate a mock NFT ID
    const nftId = `NFT-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Insert the action with default values for purchased, purchaserId, purchasedAt
    const [action] = await db
      .insert(actions)
      .values({
        ...insertAction,
        nftId,
        purchased: false,
      })
      .returning();
    
    return action;
  }

  async purchaseAction(actionId: number, userId: number): Promise<Action> {
    // Update the action as purchased
    const [action] = await db
      .update(actions)
      .set({
        purchased: true,
        purchaserId: userId,
        purchasedAt: new Date()
      })
      .where(eq(actions.id, actionId))
      .returning();
    
    if (!action) {
      throw new Error("Action not found");
    }
    
    return action;
  }
  
  // Method to seed initial data if needed
  async seedInitialData() {
    // Check if we already have users
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already has data, skipping seed");
      return;
    }
    
    // Otherwise, seed the database
    console.log("Seeding initial database data...");
    
    // Create sample users
    const [user1] = await db
      .insert(users)
      .values({
        username: "jsmith",
        password: "$2b$10$A.1cRY2vyMN2K39yEw5JUOa.5r4rZDGFgImbMkDEwXZ.G39gS7e8K", // "password123"
        name: "John Smith",
        email: "john@example.com",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
        walletAddress: "addr1qxy8p07tr8s70za207wuhq8k2expx5h4kpk4vj2wca9rnfvlh8azrty0jgh9cnyupun5xpfy644kyjy6a5kejcet9cqt2y5yx"
      })
      .returning();
    
    const [user2] = await db
      .insert(users)
      .values({
        username: "sarah",
        password: "$2b$10$A.1cRY2vyMN2K39yEw5JUOa.5r4rZDGFgImbMkDEwXZ.G39gS7e8K", // "password123"
        name: "Sarah Jenkins",
        email: "sarah@example.com",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=776&q=80",
        walletAddress: "addr1qx0e458sd9xrt5v3wvrtdqve43aawv0rzlmhk9flpplk52rcmjyd2yvdsccj7muvt2xvj6vvgzvp4ksls5pllvuxa4q2y7n08"
      })
      .returning();
    
    // Create sample wooperatives
    const [wooperative1] = await db
      .insert(wooperatives)
      .values({
        name: "Ocean Cleanup Initiative",
        description: "Coordinating beach cleanups and marine conservation efforts worldwide through local actions and global impact.",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
        category: "Environmental",
        charter: "We aim to clean up beaches and protect marine life through coordinated actions worldwide.",
        proposerShare: 70,
        wooperativeShare: 25,
        solidarityShare: 5,
        creatorId: user1.id,
        memberCount: 128
      })
      .returning();
    
    const [wooperative2] = await db
      .insert(wooperatives)
      .values({
        name: "Local Farmers Support",
        description: "Supporting small-scale sustainable farmers through direct investment, knowledge sharing, and local food initiatives.",
        image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
        category: "Agriculture",
        charter: "We support small-scale farmers to promote sustainable agriculture and food security.",
        proposerShare: 75,
        wooperativeShare: 20,
        solidarityShare: 5,
        creatorId: user2.id,
        memberCount: 97
      })
      .returning();
    
    const [wooperative3] = await db
      .insert(wooperatives)
      .values({
        name: "Tech Education Access",
        description: "Breaking down barriers to technology education through mentorship, equipment donations, and community workshops.",
        image: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
        category: "Education",
        charter: "We provide technology education to underserved communities to help bridge the digital divide.",
        proposerShare: 65,
        wooperativeShare: 30,
        solidarityShare: 5,
        creatorId: user1.id,
        memberCount: 145
      })
      .returning();
    
    // Create sample memberships
    await db
      .insert(memberships)
      .values([
        {
          userId: user1.id,
          wooperativeId: wooperative1.id,
          role: "coordinator"
        },
        {
          userId: user1.id,
          wooperativeId: wooperative3.id,
          role: "coordinator"
        },
        {
          userId: user2.id,
          wooperativeId: wooperative2.id,
          role: "coordinator"
        }
      ]);
    
    // Create sample actions
    await db
      .insert(actions)
      .values([
        {
          title: "Beach Cleanup - 300lbs Removed",
          description: "Organized team of volunteers to remove 300lbs of plastic and debris from Venice Beach shoreline and surrounding areas.",
          image: "https://images.unsplash.com/photo-1547489432-cf93fa6c71ee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
          category: "Environmental",
          location: "Venice Beach, California",
          price: 85,
          nftId: "NFT-2447",
          creatorId: user1.id,
          wooperativeId: wooperative1.id,
          purchased: false,
          proofOfActivity: { images: ["beach-cleanup-1.jpg", "beach-cleanup-2.jpg"], documents: ["cleanup-report.pdf"] }
        },
        {
          title: "Community Garden Installation",
          description: "Transformed vacant lot into a productive community garden with 12 raised beds, irrigation system, and compost area.",
          image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
          category: "Agriculture",
          location: "Portland, Oregon",
          price: 120,
          nftId: "NFT-2458",
          creatorId: user2.id,
          wooperativeId: wooperative2.id,
          purchased: false,
          proofOfActivity: { images: ["garden-1.jpg", "garden-2.jpg"], documents: ["garden-plan.pdf"] }
        },
        {
          title: "Web Development Workshop",
          description: "Conducted a 2-day coding workshop for 25 disadvantaged students, covering HTML, CSS, and JavaScript fundamentals.",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80",
          category: "Education",
          location: "Chicago, Illinois",
          price: 150,
          nftId: "NFT-2409",
          creatorId: user1.id,
          wooperativeId: wooperative3.id,
          purchased: false,
          proofOfActivity: { images: ["workshop-1.jpg", "workshop-2.jpg"], documents: ["curriculum.pdf"] }
        }
      ]);
      
    console.log("Database seeding complete!");
  }
}

// Export a singleton instance
// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();

// Seed initial data (will only run if the database is empty)
storage.seedInitialData().catch(err => {
  console.error("Error seeding database:", err);
});
