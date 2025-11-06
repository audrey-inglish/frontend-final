import express from "express";
import { db } from "../db";

export async function ensureUserId(req: express.Request): Promise<number> {
  const user = req.user;
  if (!user || !user.email) throw new Error("Unauthorized");

  const email = user.email;
  const existing = await db.oneOrNone<{ id: number }>(
    `SELECT id FROM app_user WHERE email = $1`,
    [email]
  );
  if (existing) return existing.id;

  const username =
    (user as unknown as { preferred_username?: string }).preferred_username ||
    email.split("@")[0];
  const created = await db.one<{ id: number }>(
    `INSERT INTO app_user (email, username) VALUES ($1, $2) RETURNING id`,
    [email, username]
  );
  return created.id;
}
