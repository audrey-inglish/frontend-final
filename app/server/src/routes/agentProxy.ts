import express from "express";

const router = express.Router();

// Proxy endpoint that forwards requests from the browser (HTTPS) to the internal
// AI backend (which may be HTTP). This prevents mixed-content errors by keeping
// the browser request same-origin (HTTPS) while the server communicates with
// the internal AI service over HTTP.
const TARGET = process.env.AGENT_BACKEND_URL ||
  "http://ai-snow.reindeer-pinecone.ts.net:9292/v1/chat/completions";

router.post("/", async (req, res) => {
  try {
    const forwardedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const SERVER_KEY = process.env.AGENT_BACKEND_API_KEY;
    if (SERVER_KEY) {
      forwardedHeaders["Authorization"] = `Bearer ${SERVER_KEY}`;
    }

    const requestBody = {
      ...req.body,
      model: process.env.OPENAI_MODEL || req.body.model || "gpt-oss-120b",
    };

    const response = await fetch(TARGET, {
      method: "POST",
      headers: forwardedHeaders,
      body: JSON.stringify(requestBody),
    });

    const bodyText = await response.text();

    // Mirror status and content-type
    res.status(response.status);
    const ct = response.headers.get("content-type");
    if (ct) res.setHeader("Content-Type", ct);
    return res.send(bodyText);
  } catch (err) {
    console.error("Agent proxy error:", err);
    return res.status(502).json({ error: { code: "AGENT_PROXY_ERROR", message: "Failed to proxy agent request" } });
  }
});

export default router;
