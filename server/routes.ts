import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

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
