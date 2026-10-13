import { TUTOR_AGENTS } from "../agents.js";
import { ai, generateSpeech } from "./_gemini.js";

export const config = { maxDuration: 45 };

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { text, agentId, voice } = body;
  const agent = TUTOR_AGENTS[agentId || "foundation"] || TUTOR_AGENTS.foundation;
  const voiceName = voice || agent.voice || "Puck";

  if (!ai) {
    return res.status(503).json({ error: "GEMINI_API_KEY_MISSING" });
  }

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {
    const audioBase64 = await generateSpeech(text, voiceName);
    if (!audioBase64) {
      return res.status(500).json({ error: "Failed to generate speech" });
    }
    return res.status(200).json({ audioBase64, mimeType: "audio/wav" });
  } catch (err: any) {
    console.error("[api/tts]", err?.message);
    return res.status(500).json({ error: err?.message || "TTS error" });
  }
}
