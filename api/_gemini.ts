import { GoogleGenAI } from "@google/genai";

export const apiKey = process.env.GEMINI_API_KEY || "";
export const hasKey = Boolean(apiKey && apiKey !== "your_gemini_api_key_here");
export const ai = hasKey ? new GoogleGenAI({ apiKey }) : null;

const CHAT_MODELS = [process.env.GEMINI_MODEL, "gemini-3.8-flash", "gemini-2.5-flash"].filter(Boolean) as string[];
const TTS_MODELS = [process.env.GEMINI_TTS_MODEL, "gemini-3.8-flash-lite-tts", "gemini-2.5-flash-preview-tts"].filter(Boolean) as string[];

async function tryModels(models: string[], fn: (m: string) => Promise<any>) {
  let lastErr: any;
  for (const m of models) {
    try { return await fn(m); } catch (e: any) { lastErr = e; if (/api key|API_KEY|PERMISSION/i.test(e?.message || "")) break; }
  }
  throw lastErr;
}

export function chatModels() { return CHAT_MODELS; }
export function generateChat(contents: any, config: any) {
  return tryModels(CHAT_MODELS, (model) => ai!.models.generateContent({ model, contents, config }));
}

export async function generateSpeech(text: string, voiceName: string): Promise<string | null> {
  if (!ai) return null;
  const clean = text.replace(/[*#_`$]/g, "").replace(/\(.*?\)/g, "").replace(/\[.*?\]/g, "").trim().slice(0, 1500);
  if (!clean) return null;
  try {
    const r = await tryModels(TTS_MODELS, (model) => ai!.models.generateContent({
      model, contents: clean,
      config: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName || "Puck" } } } } as any,
    }));
    const part = r.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!part?.data) return null;
    if (/wav|mpeg|mp3|ogg/i.test(part.mimeType || "")) return part.data;
    const rate = Number(/rate=(\d+)/.exec(part.mimeType || "")?.[1] || 24000);
    return pcmToWav(Buffer.from(part.data, "base64"), rate).toString("base64");
  } catch { return null; }
}

function pcmToWav(pcm: Buffer, rate: number): Buffer {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
