import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { universities, policies, sources } from "@db/schema";
import { eq, like, and } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Universities
  app.get("/api/universities", async (req, res) => {
    const { search } = req.query;
    try {
      let query = db.select().from(universities);
      if (search) {
        query = query.where(like(universities.name, `%${search}%`));
      }
      const data = await query;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch universities" });
    }
  });

  app.get("/api/universities/:id", async (req, res) => {
    try {
      const university = await db.query.universities.findFirst({
        where: eq(universities.id, parseInt(req.params.id)),
        with: {
          policies: true,
          sources: true,
        },
      });
      if (!university) {
        return res.status(404).json({ error: "University not found" });
      }
      res.json(university);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch university" });
    }
  });

  app.post("/api/universities", async (req, res) => {
    try {
      const newUniversity = await db.insert(universities).values(req.body).returning();
      res.status(201).json(newUniversity[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create university" });
    }
  });

  // Policies
  app.get("/api/policies", async (req, res) => {
    const { universityId, category } = req.query;
    try {
      let query = db.select().from(policies);
      if (universityId) {
        query = query.where(eq(policies.universityId, parseInt(universityId as string)));
      }
      if (category) {
        query = query.where(eq(policies.category, category as string));
      }
      const data = await query;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch policies" });
    }
  });

  app.post("/api/policies", async (req, res) => {
    try {
      const newPolicy = await db.insert(policies).values(req.body).returning();
      res.status(201).json(newPolicy[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create policy" });
    }
  });

  // Sources
  app.get("/api/sources", async (req, res) => {
    const { universityId, policyId } = req.query;
    try {
      let query = db.select().from(sources);
      if (universityId) {
        query = query.where(eq(sources.universityId, parseInt(universityId as string)));
      }
      if (policyId) {
        query = query.where(eq(sources.policyId, parseInt(policyId as string)));
      }
      const data = await query;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sources" });
    }
  });

  app.post("/api/sources", async (req, res) => {
    try {
      const newSource = await db.insert(sources).values(req.body).returning();
      res.status(201).json(newSource[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create source" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
