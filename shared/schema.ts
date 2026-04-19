import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Local projects that aren't on GitHub yet
export const localProjects = sqliteTable("local_projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  language: text("language"),
  status: text("status").notNull().default("in-progress"), // in-progress, planned, on-hold, completed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  tags: text("tags"), // JSON array stored as text
  createdAt: text("created_at").notNull(),
});

export const insertLocalProjectSchema = createInsertSchema(localProjects).omit({ id: true });
export type InsertLocalProject = z.infer<typeof insertLocalProjectSchema>;
export type LocalProject = typeof localProjects.$inferSelect;
