import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for static data files
  app.get("/api/deals", async (req, res) => {
    try {
      const dealsPath = path.resolve(process.cwd(), "client/src/data/deals.json");
      const dealsData = await fs.promises.readFile(dealsPath, "utf-8");
      res.json(JSON.parse(dealsData));
    } catch (error) {
      console.error("Error reading deals data:", error);
      res.status(500).json({ message: "Error loading deals data" });
    }
  });

  app.get("/api/companies", async (req, res) => {
    try {
      const companiesPath = path.resolve(process.cwd(), "client/src/data/companies.json");
      const companiesData = await fs.promises.readFile(companiesPath, "utf-8");
      res.json(JSON.parse(companiesData));
    } catch (error) {
      console.error("Error reading companies data:", error);
      res.status(500).json({ message: "Error loading companies data" });
    }
  });

  app.get("/api/indications", async (req, res) => {
    try {
      const indicationsPath = path.resolve(process.cwd(), "client/src/data/indications.json");
      const indicationsData = await fs.promises.readFile(indicationsPath, "utf-8");
      res.json(JSON.parse(indicationsData));
    } catch (error) {
      console.error("Error reading indications data:", error);
      res.status(500).json({ message: "Error loading indications data" });
    }
  });

  app.get("/api/modalities", async (req, res) => {
    try {
      const modalitiesPath = path.resolve(process.cwd(), "client/src/data/modalities.json");
      const modalitiesData = await fs.promises.readFile(modalitiesPath, "utf-8");
      res.json(JSON.parse(modalitiesData));
    } catch (error) {
      console.error("Error reading modalities data:", error);
      res.status(500).json({ message: "Error loading modalities data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
