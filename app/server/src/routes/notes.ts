import express from "express";
import { db } from "../db";
import { ensureUserId } from "../utils/user";

const router = express.Router();

// List notes for current user; optional ?dashboard_id= to filter
router.get("/", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const dashboardId = req.query.dashboard_id
      ? Number(req.query.dashboard_id)
      : null;

    const notes = await db.any(
      `SELECT n.id, n.dashboard_id, n.title, n.content, n.source, n.uploaded_at
			 FROM note_upload n
			 JOIN dashboard d ON d.id = n.dashboard_id
			 WHERE d.user_id = $1 ${dashboardId ? "AND d.id = $2" : ""}
			 ORDER BY n.uploaded_at DESC`,
      dashboardId ? [userId, dashboardId] : [userId]
    );
    res.json({ notes });
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
    const note = await db.oneOrNone(
      `SELECT n.id, n.dashboard_id, n.title, n.content, n.source, n.uploaded_at
			 FROM note_upload n
			 JOIN dashboard d ON d.id = n.dashboard_id
			 WHERE n.id = $1 AND d.user_id = $2`,
      [id, userId]
    );
    if (!note) return res.status(404).json({ error: "Not found" });
    res.json({ note });
  } catch (err) {
    console.error("GET /api/notes/:id error:", err);
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

// Create note
router.post("/", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const { dashboard_id, title, content, source } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "title and content required" });

    // ensure dashboard belongs to user
    if (dashboard_id) {
      const d = await db.oneOrNone(
        `SELECT id FROM dashboard WHERE id = $1 AND user_id = $2`,
        [dashboard_id, userId]
      );
      if (!d)
        return res
          .status(400)
          .json({ error: "dashboard not found or not owned" });
    }

    const created = await db.one(
      `INSERT INTO note_upload (dashboard_id, title, content, source) VALUES ($1, $2, $3, $4) RETURNING id, dashboard_id, title, content, source, uploaded_at`,
      [dashboard_id || null, title, content, source || null]
    );
    res.status(201).json({ note: created });
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
    const { title, content, source } = req.body;

    const existing = await db.oneOrNone(
      `SELECT n.id FROM note_upload n JOIN dashboard d ON d.id = n.dashboard_id WHERE n.id = $1 AND d.user_id = $2`,
      [id, userId]
    );
    if (!existing) return res.status(404).json({ error: "Not found" });

    const updated = await db.one(
      `UPDATE note_upload SET title = $1, content = $2, source = $3 WHERE id = $4 RETURNING id, dashboard_id, title, content, source, uploaded_at`,
      [title || null, content || null, source || null, id]
    );
    res.json({ note: updated });
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

    const result = await db.result(
      `DELETE FROM note_upload n USING dashboard d WHERE n.id = $1 AND n.dashboard_id = d.id AND d.user_id = $2`,
      [id, userId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /api/notes/:id error:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
