import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const createUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  identifier: z.string().min(1),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // POST /api/users - create a new user
  app.post("/api/users", async (req, res, next) => {
    try {
      const parsed = createUserSchema.parse(req.body);
      // check uniqueness by email/username
      const existing = await storage.getUserByUsername(parsed.username);
      if (existing) {
        return res.status(409).json({ message: "User already exists" });
      }

      const created = await storage.createUser(parsed);
      const { password, ...safe } = created as any;
      return res.status(201).json(safe);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/users/:id - get user by id
  app.get("/api/users/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "Not found" });
      const { password, ...safe } = user as any;
      return res.json(safe);
    } catch (err) {
      next(err);
    }
  });

  return httpServer;
}
