import express from "express";
import { ensureUserId } from "../utils/user";
import {
  NoteCreateSchema,
  NoteUpdateSchema,
  NoteSchema,
  NotesListResponseSchema,
} from "../schemas";
import { noteService } from "../services";

const router = express.Router();

// List notes for current user; optional ?dashboard_id= to filter
router.get("/", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const dashboardId = req.query.dashboard_id
      ? Number(req.query.dashboard_id)
      : undefined;

    const notes = await noteService.listByUserId(userId, dashboardId);
    // validate response shape
    const parsed = NotesListResponseSchema.safeParse({ notes });
    if (!parsed.success) {
      console.error("Validation error for notes list:", parsed.error.format());
      return res.status(500).json({ error: "Invalid data from database" });
    }
    res.json(parsed.data);
  } catch (err) {
    console.error("GET /api/notes error:", err);
    res.status(500).json({ error: "Failed to list notes" });
  }
});

// Get single note
router.get("/:id", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const id = Number(req.params.id);
    const note = await noteService.getById(id, userId);
    if (!note) return res.status(404).json({ error: "Not found" });
    const parsed = NoteSchema.safeParse(note);
    if (!parsed.success) {
      console.error("Validation error for note:", parsed.error.format());
      return res.status(500).json({ error: "Invalid data from database" });
    }
    res.json({ note: parsed.data });
  } catch (err) {
    console.error("GET /api/notes/:id error:", err);
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

// Create note
router.post("/", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    // validate request
    const parsed = NoteCreateSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid request", details: parsed.error.format() });
    const { dashboard_id, title, content, source } = parsed.data;

    const created = await noteService.create(userId, dashboard_id, title, content, source);
    if (!created) {
      return res
        .status(400)
        .json({ error: "dashboard not found or not owned" });
    }

    const validated = NoteSchema.safeParse(created);
    if (!validated.success) {
      console.error("Validation error for created note:", validated.error.format());
      return res.status(500).json({ error: "Invalid data created" });
    }
    res.status(201).json({ note: validated.data });
  } catch (err) {
    console.error("POST /api/notes error:", err);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// Update note
router.put("/:id", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const id = Number(req.params.id);
    const parsed = NoteUpdateSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid request", details: parsed.error.format() });
    const { title, content, source } = parsed.data;

    const updated = await noteService.update(id, userId, title, content, source);
    if (!updated) return res.status(404).json({ error: "Not found" });

    const validated = NoteSchema.safeParse(updated);
    if (!validated.success) {
      console.error("Validation error for updated note:", validated.error.format());
      return res.status(500).json({ error: "Invalid data updated" });
    }
    res.json({ note: validated.data });
  } catch (err) {
    console.error("PUT /api/notes/:id error:", err);
    res.status(500).json({ error: "Failed to update note" });
  }
});

// Delete note
router.delete("/:id", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const id = Number(req.params.id);

    const deleted = await noteService.delete(id, userId);
    if (!deleted)
      return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /api/notes/:id error:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
