import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";

// Schema for wallet authentication
const walletAuthSchema = z.object({
  address: z.string().min(1),
  message: z.string().min(1),
  signature: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Wallet Authentication route
  app.post("/api/wallet-auth", async (req, res, next) => {
    try {
      const { address, message, signature } = walletAuthSchema.parse(req.body);
      
      // In a production environment, you would:
      // 1. Verify the signature using Cardano cryptography
      // 2. Check if the address corresponds to a valid Cardano address
      // 3. If the message includes a timestamp, verify it's recent
      
      // For demo purposes, we'll accept the signature and link it with the current user
      if (!req.isAuthenticated()) {
        return res.status(401).json({ 
          message: "Please log in first before connecting a wallet"
        });
      }
      
      try {
        // Associate wallet address with user
        const updatedUser = await storage.updateUserWallet(req.user.id, address);
        
        if (updatedUser) {
          // Update the session with the new user data
          req.login(updatedUser, (err) => {
            if (err) {
              return next(err);
            }
            return res.status(200).json({ 
              message: "Wallet linked successfully", 
              user: updatedUser
            });
          });
        } else {
          return res.status(500).json({ message: "Failed to update user wallet" });
        }
      } catch (err) {
        const error = err as Error;
        return res.status(500).json({ message: "Error updating wallet: " + error.message });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  });

  // Wooperative routes
  app.get("/api/wooperatives", async (req, res, next) => {
    try {
      const wooperatives = await storage.getWooperatives();
      res.json(wooperatives);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/wooperatives/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const wooperative = await storage.getWooperative(id);
      
      if (!wooperative) {
        return res.status(404).json({ message: "Wooperative not found" });
      }
      
      res.json(wooperative);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/wooperatives", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const wooperativeData = { ...req.body, creatorId: req.user.id };
      const wooperative = await storage.createWooperative(wooperativeData);
      res.status(201).json(wooperative);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/my-wooperatives", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const wooperatives = await storage.getWooperativesByUser(req.user.id);
      res.json(wooperatives);
    } catch (err) {
      next(err);
    }
  });

  // Membership routes
  app.post("/api/wooperatives/:id/join", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const wooperativeId = parseInt(req.params.id);
      const wooperative = await storage.getWooperative(wooperativeId);
      
      if (!wooperative) {
        return res.status(404).json({ message: "Wooperative not found" });
      }
      
      const membership = await storage.createMembership({
        userId: req.user.id,
        wooperativeId,
        role: "member"
      });
      
      res.status(201).json(membership);
    } catch (err) {
      next(err);
    }
  });

  // Action routes
  app.get("/api/actions", async (req, res, next) => {
    try {
      const actions = await storage.getActions();
      res.json(actions);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/actions/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const action = await storage.getAction(id);
      
      if (!action) {
        return res.status(404).json({ message: "Action not found" });
      }
      
      res.json(action);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/actions", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const actionData = { ...req.body, creatorId: req.user.id };
      const action = await storage.createAction(actionData);
      res.status(201).json(action);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/actions/:id/purchase", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const actionId = parseInt(req.params.id);
      const action = await storage.getAction(actionId);
      
      if (!action) {
        return res.status(404).json({ message: "Action not found" });
      }
      
      if (action.purchased) {
        return res.status(400).json({ message: "Action already purchased" });
      }
      
      const updatedAction = await storage.purchaseAction(actionId, req.user.id);
      res.json(updatedAction);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/my-actions", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const actions = await storage.getActionsByUser(req.user.id);
      res.json(actions);
    } catch (err) {
      next(err);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
