import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { v4 as uuidv4 } from 'uuid';

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Journal Entries
  app.get("/api/journal/entries", async (req, res) => {
    try {
      const entries = await storage.getJournalEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });
  
  app.post("/api/journal/entries", async (req, res) => {
    try {
      const entry = req.body;
      
      // Validate entry
      if (!entry.id || !entry.title || !entry.date || !entry.content) {
        return res.status(400).json({ message: "Invalid journal entry format" });
      }
      
      const savedEntry = await storage.saveJournalEntry(entry);
      res.status(201).json(savedEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to save journal entry" });
    }
  });
  
  app.get("/api/journal/entries/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const entry = await storage.getJournalEntryById(id);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });
  
  // Flowers
  app.get("/api/flowers", async (req, res) => {
    try {
      const flowers = await storage.getFlowers();
      res.json(flowers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flowers" });
    }
  });
  
  app.post("/api/flowers", async (req, res) => {
    try {
      const flower = req.body;
      
      // Validate flower
      if (!flower.id || !flower.journalId || !flower.answers) {
        return res.status(400).json({ message: "Invalid flower format" });
      }
      
      const savedFlower = await storage.saveFlower(flower);
      res.status(201).json(savedFlower);
    } catch (error) {
      res.status(500).json({ message: "Failed to save flower" });
    }
  });
  
  app.get("/api/flowers/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const flower = await storage.getFlowerById(id);
      
      if (!flower) {
        return res.status(404).json({ message: "Flower not found" });
      }
      
      res.json(flower);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flower" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
