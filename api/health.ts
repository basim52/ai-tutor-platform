import { hasKey } from "./_gemini.js";
export default function handler(_req: any, res: any) {
  res.status(200).json({ ok: true, gemini: hasKey, mode: "turn-based" });
}
