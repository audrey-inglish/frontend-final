import express from "express";
import { z } from "zod";
import { getOpenAIClient } from "../openAiClient";
import {
  FlashcardsArraySchema as FlashcardsArraySchema,
  Flashcard as FlashcardType,
  FlashcardSet as FlashcardSetType,
} from "../schemas/flashcard";
import { db } from "../db";

const router = express.Router();

const BodySchema = z.object({
  text: z.string().min(1),
  dashboard_id: z.number().optional(),
});

router.post("/", async (req, res) => {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "`text` is required" },
    });
  }

  const { text, dashboard_id } = parsed.data;
  console.log(`[generateFlashcards] Received request with dashboard_id: ${dashboard_id}`);
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL ?? "gpt-oss-120b";

  const systemPrompt = `You are a strict JSON generator. Given note text, extract a series of flashcards as study material.
Return ONLY a JSON array. Each array item must be an object with keys:
- "front": short string phrase or question summarizing the concept,
- "back": brief explanation of the concept (1-2 sentences)`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0,
      max_tokens: 2000,
    });

    let rawText = "";

    try {
      const firstChoice = completion.choices[0];
      if (firstChoice?.message?.content) {
        rawText = firstChoice.message.content;
      } else {
        throw new Error("No content in response");
      }
    } catch {
      rawText = String(completion);
    }

    // Attempt parsing JSON
    let flashcards: unknown;
    console.log("Unparsed:", rawText);

    try {
      flashcards = JSON.parse(rawText);
    } catch {
      // attempt to extract JSON array substring
      const match = rawText.match(/(\[.*\])/s);
      if (match) {
        try {
          flashcards = JSON.parse(match[1]);
        } catch {
          throw new Error("PARSE_FAILED");
        }
      } else {
        throw new Error("PARSE_FAILED");
      }
    }

    // Validate shape
    const validated = FlashcardsArraySchema.safeParse(flashcards);
    if (!validated.success) {
      console.error("Validation failed:", validated.error, "rawText:", rawText);
      return res.status(502).json({
        error: {
          code: "PARSE_VALIDATION_FAILED",
          message: "Model returned invalid structure.",
        },
      });
    }

    if (dashboard_id) {
      console.log(`[generateFlashcards] Saving ${validated.data.length} flashcards to database for dashboard ${dashboard_id}`);
      try {
        // Verify dashboard exists
        const dashboard = await db.oneOrNone(
          `SELECT id FROM dashboard WHERE id = $1`,
          [dashboard_id]
        );

        if (!dashboard) {
          return res.status(404).json({
            error: { code: "NOT_FOUND", message: "Dashboard not found" },
          });
        }

        // Remove any existing flashcard sets for this dashboard (cascades to flashcards)
        await db.none(`DELETE FROM flashcard_set WHERE dashboard_id = $1`, [
          dashboard_id,
        ]);

        const setTitle = `AI-generated set ${new Date().toISOString()}`;
        const flashcardSet = await db.one(
          `INSERT INTO flashcard_set (dashboard_id, title) VALUES ($1, $2) RETURNING id, dashboard_id, title`,
          [dashboard_id, setTitle]
        );

        const savedFlashcards: Array<
          FlashcardType & {
            id: number;
            flashcard_set_id: number;
            created_at: string | null;
            mastery_score: number | null;
          }
        > = [];
        for (const flashcard of validated.data) {
          const result = await db.one(
            `INSERT INTO flashcard (flashcard_set_id, front, back) 
             VALUES ($1, $2, $3) 
             RETURNING id, flashcard_set_id, front, back, created_at, mastery_score`,
            [flashcardSet.id, flashcard.front, flashcard.back]
          );
          savedFlashcards.push({
            ...result,
            created_at:
              result.created_at instanceof Date
                ? result.created_at.toISOString()
                : result.created_at,
          });
        }

        console.log(`[generateFlashcards] Successfully saved ${savedFlashcards.length} flashcards to database`);
  return res.json({ flashcard_set: flashcardSet as FlashcardSetType, flashcards: savedFlashcards });
      } catch (dbErr) {
        const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
        console.error("Database error while saving flashcards:", message);
        return res.status(500).json({
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to save flashcards to database.",
          },
        });
      }
    }

    console.log(`[generateFlashcards] No dashboard_id provided, returning ${validated.data.length} unsaved flashcards`);
    return res.json({ flashcards: validated.data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("OpenAI/parse error:", message);
    return res.status(502).json({
      error: {
        code: "AI_SERVICE_ERROR",
        message: "Failed to parse notes. Please try again later.",
      },
    });
  }
});

export default router;
