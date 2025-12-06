// app/server/src/routes/extractTextFromImage.ts
import express from "express";
import { z } from "zod";

const router = express.Router();

const BodySchema = z.object({
  imageDataUrl: z.string().min(1), // base64 data URL from frontend
  dashboard_id: z.number().optional(),
});

/**
 * POST /api/extractTextFromImage
 * Accept a base64 image and extract text content using AI vision model
 */
router.post("/", async (req, res) => {
  console.log("Extract text from image request received");

  try {
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) {
      console.error("Invalid request body");
      return res.status(400).json({
        error: "INVALID_INPUT",
        message: "imageDataUrl is required",
      });
    }

    const { imageDataUrl } = parsed.data;

    console.log("Image data received, length:", imageDataUrl.length);
    console.log("Starting AI vision analysis...");

    const extractionPrompt = `Analyze this image and extract ALL visible text content.

      This appears to be a student's notes or study material. Please:
      1. Extract all text you can see in the image
      2. Preserve the structure and organization of the notes
      3. Include headings, bullet points, and any other formatting cues
      4. If there are diagrams or charts, describe them briefly

      Return the extracted text in a clear, readable format. Do NOT add any commentary or explanations - just return the extracted text content as you see it.`;

    let aiResponse: string;
    try {
      const base =
        process.env.AI_BASE_URL ??
        "http://ai-snow.reindeer-pinecone.ts.net:9292";
      const url = `${base}/v1/chat/completions`;
      const apiKey = process.env.OPENAI_API_KEY;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey && apiKey.trim()) {
        headers.Authorization = `Bearer ${apiKey}`;
      }

      const payload = {
        model: "gemma3-27b",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: extractionPrompt },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      };

      console.log("Sending request to AI service:", url);
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error("AI API error:", response.status, responseText);
        throw new Error(`AI API error: ${response.status}`);
      }

      const responseJson = JSON.parse(responseText);
      aiResponse = responseJson?.choices?.[0]?.message?.content ?? "";

      if (!aiResponse) {
        console.error("No content in AI response");
        throw new Error("No content extracted from image");
      }

      console.log("AI Response received, length:", aiResponse.length);
      console.log("Extracted text preview:", aiResponse.substring(0, 200));
    } catch (aiError) {
      console.error("AI call failed:", aiError);
      return res.status(502).json({
        error: "Failed to analyze image with AI service",
        details: aiError instanceof Error ? aiError.message : "Unknown error",
      });
    }

    res.json({
      success: true,
      text: aiResponse,
    });
  } catch (error) {
    console.error("Extract text from image error:", error);

    res.status(500).json({
      error: "Failed to extract text from image",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
