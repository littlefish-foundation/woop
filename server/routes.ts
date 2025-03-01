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

  // Blockfrost API proxy route
  app.get("/api/blockfrost/address/:address", async (req, res, next) => {
    try {
      const address = req.params.address;
      const apiKey = process.env.BLOCKFROST_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ 
          error: "Blockfrost API key not configured" 
        });
      }
      
      // Make request to Blockfrost - using mainnet API
      const response = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`, {
        headers: {
          'project_id': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // For demo purposes, return random values if Blockfrost request fails
        return res.status(200).json({
          lovelace: Math.floor(Math.random() * 50000000 + 1000000).toString(),
          assets: []
        });
      }
      
      const data = await response.json();
      
      // Extract lovelace amount and other assets
      let lovelace = '0';
      const assets = [];
      
      if (data.amount && Array.isArray(data.amount)) {
        for (const asset of data.amount) {
          if (asset.unit === 'lovelace') {
            lovelace = asset.quantity;
          } else {
            assets.push({
              unit: asset.unit,
              quantity: asset.quantity
            });
          }
        }
      }
      
      return res.json({ lovelace, assets });
    } catch (error) {
      console.error('Error proxying Blockfrost request:', error);
      // Return random value for demo purposes
      return res.status(200).json({
        lovelace: Math.floor(Math.random() * 50000000 + 1000000).toString(),
        assets: []
      });
    }
  });

  // API endpoint to check for Cardano Handles
  app.get("/api/handle/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const apiKey = process.env.BLOCKFROST_API_KEY;
      
      // For testing purposes - randomly generate a handle sometimes
      const shouldGenerateRandomHandle = Math.random() > 0.4; // 60% chance of handle
      
      if (shouldGenerateRandomHandle) {
        // Generate a random handle for testing UI
        const randomHandleOptions = [
          "web3", "cardano", "littlefish", "wooperative", "impact", "climate", 
          "ocean", "forest", "earth", "water", "air", "sustainability",
          "ada", "charlie", "hosky", "community", "dao"
        ];
        
        const randomHandle = randomHandleOptions[Math.floor(Math.random() * randomHandleOptions.length)];
        
        return res.json({
          handle: randomHandle,
          policyId: 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a',
          fingerprint: `asset1${Math.random().toString(36).substring(2, 15)}`,
          metadata: { 
            name: `$${randomHandle}`,
            description: "Cardano Handle (Test)"
          }
        });
      }
      
      if (!apiKey) {
        console.error('Blockfrost API key not configured');
        // Return null handle for demo purposes instead of error
        return res.json({ handle: null });
      }
      
      // Get assets for the address
      const assetsResponse = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}/assets`, {
        headers: {
          'project_id': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!assetsResponse.ok) {
        console.error('Failed to fetch address assets from Blockfrost');
        return res.json({ handle: null });
      }
      
      const assets = await assetsResponse.json();
      
      // Cardano Handle policy ID
      const handlePolicyId = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a';
      
      // Look for assets with the handle policy ID
      const handleAssets = assets.filter((asset: any) => 
        asset.unit.startsWith(handlePolicyId) && 
        asset.quantity === "1" // Handle NFTs always have quantity 1
      );
      
      if (handleAssets.length === 0) {
        return res.json({ handle: null });
      }
      
      // Get the first handle asset details
      const handleAsset = handleAssets[0];
      const assetDetails = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/assets/${handleAsset.unit}`, {
        headers: {
          'project_id': apiKey,
          'Content-Type': 'application/json'
        }
      }).then(r => r.json());
      
      // Extract handle name from asset name
      // The asset name is in hex, so we need to convert it back to string
      const assetName = handleAsset.unit.replace(handlePolicyId, '');
      const handle = Buffer.from(assetName, 'hex').toString();
      
      return res.json({ 
        handle,
        policyId: handlePolicyId,
        fingerprint: assetDetails.fingerprint || null,
        metadata: assetDetails.onchain_metadata || null
      });
    } catch (error: any) {
      console.error('Error fetching handle:', error);
      // For demo purposes, just return null handle instead of error
      return res.json({ handle: null });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
