import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { localProjects, type InsertLocalProject, type LocalProject } from "@shared/schema";
import { eq } from "drizzle-orm";

const sqlite = new Database("devpulse.db");
const db = drizzle(sqlite);

// Create table if not exists
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS local_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    language TEXT,
    status TEXT NOT NULL DEFAULT 'in-progress',
    priority TEXT NOT NULL DEFAULT 'medium',
    tags TEXT,
    created_at TEXT NOT NULL
  )
`);

export interface IStorage {
  getLocalProjects(): LocalProject[];
  getLocalProject(id: number): LocalProject | undefined;
  createLocalProject(project: InsertLocalProject): LocalProject;
  updateLocalProject(id: number, project: Partial<InsertLocalProject>): LocalProject | undefined;
  deleteLocalProject(id: number): void;
}

export class DatabaseStorage implements IStorage {
  getLocalProjects(): LocalProject[] {
    return db.select().from(localProjects).all();
  }

  getLocalProject(id: number): LocalProject | undefined {
    return db.select().from(localProjects).where(eq(localProjects.id, id)).get();
  }

  createLocalProject(project: InsertLocalProject): LocalProject {
    return db.insert(localProjects).values(project).returning().get();
  }

  updateLocalProject(id: number, project: Partial<InsertLocalProject>): LocalProject | undefined {
    const existing = this.getLocalProject(id);
    if (!existing) return undefined;
    return db.update(localProjects).set(project).where(eq(localProjects.id, id)).returning().get();
  }

  deleteLocalProject(id: number): void {
    db.delete(localProjects).where(eq(localProjects.id, id)).run();
  }
}

export const storage = new DatabaseStorage();
