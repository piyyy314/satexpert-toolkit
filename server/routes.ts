import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";

const GITHUB_USERNAME = "piyyy314";
const GITHUB_API = "https://api.github.com";

async function fetchGitHub(path: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevPulse-Dashboard",
    },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function registerRoutes(server: Server, app: Express) {
  // GitHub profile
  app.get("/api/github/profile", async (_req, res) => {
    try {
      const profile = await fetchGitHub(`/users/${GITHUB_USERNAME}`);
      res.json({
        login: profile.login,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        createdAt: profile.created_at,
        htmlUrl: profile.html_url,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // GitHub repos (paginated - get first 100)
  app.get("/api/github/repos", async (_req, res) => {
    try {
      const page1 = await fetchGitHub(`/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&page=1`);
      const page2 = await fetchGitHub(`/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&page=2`);
      const repos = [...page1, ...page2].map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        updatedAt: r.updated_at,
        htmlUrl: r.html_url,
        topics: r.topics || [],
        isForked: r.fork,
        size: r.size,
      }));
      res.json(repos);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // GitHub recent events
  app.get("/api/github/events", async (_req, res) => {
    try {
      const events = await fetchGitHub(`/users/${GITHUB_USERNAME}/events/public?per_page=30`);
      const mapped = events.map((e: any) => ({
        id: e.id,
        type: e.type,
        repo: e.repo?.name?.replace(`${GITHUB_USERNAME}/`, "") || e.repo?.name,
        createdAt: e.created_at,
        action: e.payload?.action,
        ref: e.payload?.ref,
        refType: e.payload?.ref_type,
        prTitle: e.payload?.pull_request?.title,
        commits: e.payload?.commits?.length || 0,
      }));
      res.json(mapped);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Local projects CRUD
  app.get("/api/projects", (_req, res) => {
    res.json(storage.getLocalProjects());
  });

  app.post("/api/projects", (req, res) => {
    const project = storage.createLocalProject({
      ...req.body,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json(project);
  });

  app.patch("/api/projects/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const updated = storage.updateLocalProject(id, req.body);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/projects/:id", (req, res) => {
    const id = parseInt(req.params.id);
    storage.deleteLocalProject(id);
    res.status(204).send();
  });
}
