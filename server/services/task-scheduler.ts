import cron from "node-cron";
import { AIService } from "./ai-service";
import { z } from "zod";

import "dotenv/config";
import { db } from "../../db";
import { universities } from "../../db/schema";
import { eq } from "drizzle-orm";

const envSchema = z.object({
  PORTKEY_API_KEY: z.string(),
  PORTKEY_VIRTUAL_KEY: z.string(),
  BRAVE_API_KEY: z.string(),
  AI_MODEL: z.string().default("gpt-4"),
  MAX_TOKENS: z
    .string()
    .transform((val) => parseInt(val))
    .default("2000"),
});

class TaskScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private aiService: AIService;

  constructor() {
    const env = envSchema.parse(process.env);
    const config = {
      apiKey: env.PORTKEY_API_KEY,
      virtualKey: env.PORTKEY_VIRTUAL_KEY,
      braveApiKey: env.BRAVE_API_KEY,
      model: env.AI_MODEL,
      maxTokens: env.MAX_TOKENS,
    };

    this.aiService = new AIService(config);
  }

  initializeScheduledTasks() {
    // Schedule university data updates
    this.scheduleTask("updateUniversityData", "0 2 * * *", async () => {
      try {
        // Get all universities from database
        const universityList = await db.select().from(universities);

        for (const university of universityList) {
          const result = await this.aiService.researchUniversity(
            university.name,
            university.website
          );

          // Update university data
          await db
            .update(universities)
            .set({
              summary: result.summary,
              lastUpdated: new Date(),
            })
            .where(eq(universities.id, university.id));

          console.log(`Updated data for ${university.name}`);
        }
        console.log("Scheduled university data update completed");
      } catch (error) {
        console.error("Error in scheduled university data update:", error);
      }
    });
  }

  private scheduleTask(taskName: string, cronExpression: string, task: () => Promise<void>) {
    const scheduledTask = cron.schedule(cronExpression, task, {
      scheduled: true,
      timezone: "UTC",
    });

    this.tasks.set(taskName, scheduledTask);
    console.log(`Task ${taskName} scheduled with expression: ${cronExpression}`);
  }

  stopAllTasks() {
    this.tasks.forEach((task, taskName) => {
      task.stop();
      console.log(`Task ${taskName} stopped`);
    });
    this.tasks.clear();
  }
}

export const taskScheduler = new TaskScheduler();
