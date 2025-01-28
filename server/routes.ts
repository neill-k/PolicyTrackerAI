import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "../db";
import { universities, policies, sources } from "../db/schema";
import { eq, like } from "drizzle-orm";
import { AIService } from "./services/ai-service";

// Initialize AI service
const aiService = new AIService({
  apiKey: process.env.OPENAI_API_KEY || "",
  virtualKey: process.env.VIRTUAL_KEY || "",
  braveApiKey: process.env.BRAVE_API_KEY || "",
  model: "gpt-4",
  maxTokens: 2000,
});

export function registerRoutes(app: Express): Server {
  // Universities
  app.get("/api/universities", async (req, res) => {
    const { search } = req.query;
    try {
      const data = await db
        .select()
        .from(universities)
        .where(search ? like(universities.name, `%${search}%`) : undefined);
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
      const conditions = [];
      if (universityId) {
        conditions.push(eq(policies.universityId, parseInt(universityId as string)));
      }
      if (category) {
        conditions.push(eq(policies.category, category as string));
      }

      const data = await db
        .select()
        .from(policies)
        .where(conditions.length > 0 ? conditions[0] : undefined);
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
      const conditions = [];
      if (universityId) {
        conditions.push(eq(sources.universityId, parseInt(universityId as string)));
      }
      if (policyId) {
        conditions.push(eq(sources.policyId, parseInt(policyId as string)));
      }

      const data = await db
        .select()
        .from(sources)
        .where(conditions.length > 0 ? conditions[0] : undefined);
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

  // New AI research endpoint
  app.post("/api/universities/research", async (req, res) => {
    const { name, website } = req.body;

    try {
      // Research university using AI
      const research = await aiService.researchUniversity(name, website);

      // Create university record
      const [university] = await db
        .insert(universities)
        .values({
          name,
          website,
          country: "Unknown", // TODO: Add country detection
          summary: research.summary,
        })
        .returning();

      // Create policy records
      const policyRecords = await Promise.all(
        research.policies.map((policy) =>
          db
            .insert(policies)
            .values({
              ...policy,
              universityId: university.id,
            })
            .returning()
        )
      );

      // Create source records
      const sourceRecords = await Promise.all(
        research.sources.map((source) =>
          db
            .insert(sources)
            .values({
              ...source,
              universityId: university.id,
              policyId: null, // Link to specific policies if needed
            })
            .returning()
        )
      );

      res.status(201).json({
        university,
        policies: policyRecords.map(([p]) => p),
        sources: sourceRecords.map(([s]) => s),
      });
    } catch (error) {
      console.error("Research failed:", error);
      res.status(500).json({ error: "Failed to research university" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
