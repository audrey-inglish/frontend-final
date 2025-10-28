import express from "express";
import cors from "cors";
import { db } from "./db";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from backend!" });
});

interface User {
  id: number;
  name: string;
  created_at: string;
}

// Users endpoint uses pg-promise `db` to read from the users table
app.get("/api/users", async (req, res) => {
  try {
    const users = await db.any<User>(`SELECT id, username AS name, created_at FROM app_user ORDER BY id`);
    res.json({ users });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
