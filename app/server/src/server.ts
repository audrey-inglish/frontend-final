import express from "express";
import cors from "cors";
import { db } from "./db";
import { authMiddleware } from "./auth";
import dashboardsRouter from "./routes/dashboards";
import notesRouter from "./routes/notes";
import generateConceptsRouter from "./routes/generateConcepts";
import generateFlashcardsRouter from "./routes/generateFlashcards";
import flashcardsRouter from "./routes/flashcards";
import conceptsRouter from "./routes/concepts";
import quizzesRouter from "./routes/quizzes";
import generateQuizRouter from "./routes/generateQuiz";
import evaluateResponseRouter from "./routes/evaluateResponse";
import agentProxyRouter from "./routes/agentProxy";
import extractTextFromImageRouter from "./routes/extractTextFromImage";
import aiActionLogsRouter from "./routes/aiActionLogs";


const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Agent proxy: expose a same-origin endpoint for the frontend to call over HTTPS.
// The server will forward requests to the internal AI backend (possibly HTTP).
app.use("/api/agent", agentProxyRouter);

interface User {
  id: number;
  name: string;
  created_at: string;
}

app.use("/api", (req, res, next) => {
  if (
    req.path === "/" ||
    req.path === "/health" ||
    req.path === "/test" ||
    req.path === "/generateConcepts" ||
    req.path === "/generateFlashcards" ||
    req.path === "/extractTextFromImage"
  ) {
    return next();
  }
  return authMiddleware(req, res, next);
});

// Mount routers
app.use("/api/dashboards", dashboardsRouter);
app.use("/api/notes", notesRouter);
app.use("/api/concepts", conceptsRouter);
app.use("/api/flashcards", flashcardsRouter);
app.use("/api/ai-actions", aiActionLogsRouter);

app.use(generateConceptsRouter);
app.use("/api/generateFlashcards", generateFlashcardsRouter);
app.use("/api/extractTextFromImage", extractTextFromImageRouter);

app.use("/api/quizzes", quizzesRouter);
app.use("/api/generateQuiz", generateQuizRouter);
app.use("/api/evaluateResponse", evaluateResponseRouter);

// Users endpoint uses pg-promise `db` to read from the users table
app.get("/api/users", async (_req, res) => {
  try {
    const users = await db.any<User>(
      `SELECT id, username AS name, created_at FROM app_user ORDER BY id`
    );
    res.json({ users });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/api/admin", async (req, res) => {
  const user = (
    req as express.Request & { user?: { email?: string; roles?: unknown } }
  ).user;

  // If there's no authenticated user, respond with 401 and a plain text body
  if (!user || !user.email) {
    res.status(401).send("Unauthorized");
    return;
  }

  // Normalize role names to lowercase for case-insensitive check
  const roles: string[] = Array.isArray(user.roles)
    ? user.roles.map((r: unknown) => String(r).toLowerCase())
    : [];

  const isAdmin = roles.some((r) => r === "admin");

  // Always return a plain text string indicating admin status
  if (isAdmin) {
    return res.send("User is an admin");
  }

  return res.send("User is not an admin");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
