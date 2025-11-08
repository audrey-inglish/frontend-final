// app/server/src/routes/parseNotes.ts
import express from "express";
import { z } from "zod";
import { getOpenAIClient } from "../openAiClient";
import { ConceptsArraySchema } from "../schemas/concept";

const router = express.Router();

const BodySchema = z.object({
  text: z.string().min(1),
});

router.post("/api/parseNotes", async (req, res) => {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "`text` is required" },
    });
  }

  const { text } = parsed.data;
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL ?? "gpt-oss-120b";

  const systemPrompt = `You are a strict JSON generator. Given note text, extract a list of core concepts.
Return ONLY a JSON array. Each array item must be an object with keys:
- "concept_title": short string,
- "concept_summary": brief explanation of the concept (1-2 sentences),
- optional "examples": array of short example strings.`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0,
      max_tokens: 800,
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
    let concepts: unknown;
    try {
      concepts = JSON.parse(rawText);
    } catch {
      // attempt to extract JSON array substring
      const match = rawText.match(/(\[.*\])/s);
      if (match) {
        try {
          concepts = JSON.parse(match[1]);
        } catch {
          throw new Error("PARSE_FAILED");
        }
      } else {
        throw new Error("PARSE_FAILED");
      }
    }

    // Validate shape
    const validated = ConceptsArraySchema.safeParse(concepts);
    if (!validated.success) {
      console.error("Validation failed:", validated.error, "rawText:", rawText);
      return res.status(502).json({
        error: {
          code: "PARSE_VALIDATION_FAILED",
          message: "Model returned invalid structure.",
        },
      });
    }

    return res.json({ concepts: validated.data });
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
