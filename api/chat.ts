import { TUTOR_AGENTS } from "../agents.js";
import { whiteboardToolDeclarations } from "../tools.js";
import { ai, generateChat, generateSpeech } from "./_gemini.js";

export const config = { maxDuration: 60 };

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { agentId, text, imageBase64, generateAudio = true } = body;
  const agent = TUTOR_AGENTS[agentId || "foundation"] || TUTOR_AGENTS.foundation;
  if (!ai) {
    return res.status(503).json({ error: "GEMINI_API_KEY_MISSING", text: "" });
  }
  const contents = imageBase64
    ? [{ role: "user", parts: [
        { inlineData: { mimeType: "image/png", data: String(imageBase64).replace(/^data:image\/[a-z]+;base64,/, "") } },
        { text: text || "Please review my whiteboard." }] }]
    : text;
  try {
    const r = await generateChat(contents, {
      systemInstruction: agent.systemInstruction,
      tools: [{ functionDeclarations: whiteboardToolDeclarations as any }],
    });
    const whiteboardActions = (r.functionCalls || []).map((c: any) => ({ tool: c.name, payload: c.args }));
    let replyText = r.text || "";
    if (!replyText && whiteboardActions.length) replyText = "✍️";

    let audioBase64: string | null = null;
    if (generateAudio && replyText && replyText !== "✍️") {
      try {
        audioBase64 = await generateSpeech(replyText, agent.voice);
      } catch (err) {
        console.warn("[api/chat] Audio generation error:", err);
      }
    }

    return res.status(200).json({
      text: replyText,
      whiteboardActions,
      agentId: agent.id,
      voice: agent.voice,
      audioBase64
    });
  } catch (e: any) {
    console.error("[api/chat]", e?.message);
    return res.status(502).json({ error: "GEMINI_ERROR", detail: String(e?.message || "").slice(0, 300) });
  }
}
