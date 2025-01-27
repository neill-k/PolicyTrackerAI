import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website").notNull(),
  country: text("country").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  summary: text("summary"),
});

export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  universityId: integer("university_id").references(() => universities.id).notNull(),
  category: text("category").notNull(), // e.g., "teaching", "research", "governance"
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull(), // e.g., "active", "draft", "archived"
  implementationDate: timestamp("implementation_date"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  universityId: integer("university_id").references(() => universities.id).notNull(),
  policyId: integer("policy_id").references(() => policies.id),
  url: text("url").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // e.g., "official_document", "news_article", "press_release"
  retrievalDate: timestamp("retrieval_date").defaultNow(),
  content: text("content"),
  metadata: jsonb("metadata")
});

// Relations
export const universitiesRelations = relations(universities, ({ many }) => ({
  policies: many(policies),
  sources: many(sources),
}));

export const policiesRelations = relations(policies, ({ one, many }) => ({
  university: one(universities, {
    fields: [policies.universityId],
    references: [universities.id],
  }),
  sources: many(sources),
}));

export const sourcesRelations = relations(sources, ({ one }) => ({
  university: one(universities, {
    fields: [sources.universityId],
    references: [universities.id],
  }),
  policy: one(policies, {
    fields: [sources.policyId],
    references: [policies.id],
  }),
}));

// Schemas for validation
export const insertUniversitySchema = createInsertSchema(universities);
export const selectUniversitySchema = createSelectSchema(universities);

export const insertPolicySchema = createInsertSchema(policies);
export const selectPolicySchema = createSelectSchema(policies);

export const insertSourceSchema = createInsertSchema(sources);
export const selectSourceSchema = createSelectSchema(sources);

// Types
export type University = typeof universities.$inferSelect;
export type NewUniversity = typeof universities.$inferInsert;

export type Policy = typeof policies.$inferSelect;
export type NewPolicy = typeof policies.$inferInsert;

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
