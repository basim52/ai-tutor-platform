import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { TUTOR_AGENTS } from "./agents";
import { whiteboardToolDeclarations } from "./tools";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || "3000", 10);

app.use(express.json({ limit: "25mb" }));

const apiKey = process.env.GEMINI_API_KEY || "";
let isGeminiAvailable = Boolean(apiKey && apiKey !== "your_gemini_api_key_here");
const ai = isGeminiAvailable ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Attach WebSocket server to the HTTP server (multiplexed over port 3000)
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  let activeAgentId = "foundation";

  ws.on("message", async (data: string) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (parsed.type === "START_SESSION") {
        activeAgentId = parsed.agentId || "foundation";
        const agent = TUTOR_AGENTS[activeAgentId] || TUTOR_AGENTS.foundation;

        ws.send(JSON.stringify({
          type: "SESSION_STARTED",
          agentName: agent.name,
          role: agent.role,
          voice: agent.voice,
          gender: agent.gender
        }));
        return;
      }

      if (parsed.type === "USER_MESSAGE") {
        const agent = TUTOR_AGENTS[activeAgentId] || TUTOR_AGENTS.foundation;

        if (!ai) {
          handleSimulatedAgent(ws, agent, parsed);
          return;
        }

        // Multimodal support: handles text + optional canvas screenshot
        let contentsPayload: any;
        if (parsed.imageBase64) {
          const cleanedBase64 = parsed.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
          contentsPayload = [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: cleanedBase64
                  }
                },
                {
                  text: parsed.text || "Please review my whiteboard."
                }
              ]
            }
          ];
        } else {
          contentsPayload = parsed.text;
        }

        let response: any;
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: contentsPayload,
            config: {
              systemInstruction: agent.systemInstruction,
              tools: [{ functionDeclarations: whiteboardToolDeclarations as any }]
            }
          });
        } catch (apiErr: any) {
          if (
            apiErr.message?.includes("API key") ||
            apiErr.message?.includes("API_KEY") ||
            apiErr.message?.includes("400") ||
            apiErr.message?.includes("INVALID_ARGUMENT")
          ) {
            isGeminiAvailable = false;
            handleSimulatedAgent(ws, agent, parsed);
            return;
          }
          throw apiErr;
        }

        // Send whiteboard tool actions to canvas
        if (response.functionCalls && response.functionCalls.length > 0) {
          for (const call of response.functionCalls) {
            ws.send(JSON.stringify({
              type: "WHITEBOARD_ACTION",
              tool: call.name,
              payload: call.args
            }));
          }
        }

        // Send text response for chat stream
        if (response.text) {
          let audioBase64: string | null = null;
          if (isGeminiAvailable) {
            try {
              audioBase64 = await generateTutorSpeech(response.text, agent.voice, agent.gender);
            } catch {
              audioBase64 = null;
            }
          }

          ws.send(JSON.stringify({
            type: "AGENT_RESPONSE",
            text: response.text,
            voice: agent.voice,
            agentId: agent.id,
            audioBase64: audioBase64 || undefined
          }));
        }
      }
    } catch (err: any) {
      console.error("[WebSocket Error]", err.message);
      ws.send(JSON.stringify({ type: "ERROR", error: err.message }));
    }
  });
});

async function generateTutorSpeech(
  text: string,
  voiceName: string,
  gender: "male" | "female" = "male"
): Promise<string | null> {
  if (!ai || !isGeminiAvailable) return null;
  try {
    const cleanText = text
      .replace(/[*#_`$]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/\[.*?\]/g, "")
      .trim();
    if (!cleanText) return null;

    // Use gemini-3.8-flash-lite-tts with prebuiltVoiceConfig
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: cleanText,
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || "Puck"
            }
          }
        }
      } as any
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioBase64 || null;
  } catch (err: any) {
    if (
      err.message?.includes("API key") ||
      err.message?.includes("API_KEY") ||
      err.message?.includes("400") ||
      err.message?.includes("INVALID_ARGUMENT")
    ) {
      // Gracefully switch to browser acoustic voice engine without logging noisy warnings
      isGeminiAvailable = false;
    }
    return null;
  }
}

function handleSimulatedAgent(ws: WebSocket, agent: any, parsed: any) {
  // Demo simulation when GEMINI_API_KEY is not yet configured
  if (agent.id === "foundation") {
    ws.send(JSON.stringify({
      type: "WHITEBOARD_ACTION",
      tool: "drawBoardText",
      payload: {
        x: 100,
        y: 100,
        content: '📝 Rule: Subject-Verb Agreement\n"He walks" vs "They walk"',
        fontSize: "m",
        color: "blue"
      }
    }));
    if (parsed.imageBase64) {
      ws.send(JSON.stringify({
        type: "WHITEBOARD_ACTION",
        tool: "highlightError",
        payload: {
          incorrectSnippet: "She have went",
          correctedSnippet: "She went",
          explanation: "Use simple past 'went' for a completed past action."
        }
      }));
    }
  } else if (agent.id === "free_talk") {
    ws.send(JSON.stringify({
      type: "WHITEBOARD_ACTION",
      tool: "drawBoardText",
      payload: {
        x: 120,
        y: 120,
        content: '💡 Idiom: "Hit the nail on the head" (Exactly right)',
        fontSize: "m",
        color: "green"
      }
    }));
  } else {
    ws.send(JSON.stringify({
      type: "WHITEBOARD_ACTION",
      tool: "drawBoardText",
      payload: {
        x: 100,
        y: 100,
        content: `🎯 ${agent.name} (${agent.role})\nWhiteboard is ready for practice!`,
        fontSize: "m",
        color: "black"
      }
    }));
  }

  ws.send(JSON.stringify({
    type: "AGENT_RESPONSE",
    text: `Hello! I am ${agent.name} (${agent.role}). I reviewed your message and updated the whiteboard. (Running in demo mode - set GEMINI_API_KEY in .env for live Gemini 3.8 Flash responses).`
  }));
}

// Fallback HTTP route for client calls if WebSocket connection drops
app.post("/api/chat", async (req, res) => {
  try {
    const { agentId, text, imageBase64 } = req.body;
    const agent = TUTOR_AGENTS[agentId || "foundation"] || TUTOR_AGENTS.foundation;

    if (!ai) {
      return res.json({
        type: "AGENT_RESPONSE",
        text: `Hello! I am ${agent.name} (${agent.role}). (Demo mode active).`,
        whiteboardActions: [
          {
            tool: "drawBoardText",
            payload: {
              x: 100,
              y: 100,
              content: `📝 Session with ${agent.name}`,
              fontSize: "m",
              color: "blue"
            }
          }
        ]
      });
    }

    let contentsPayload: any;
    if (imageBase64) {
      const cleanedBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      contentsPayload = [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/png", data: cleanedBase64 } },
            { text: text || "Please review my whiteboard." }
          ]
        }
      ];
    } else {
      contentsPayload = text;
    }

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contentsPayload,
        config: {
          systemInstruction: agent.systemInstruction,
          tools: [{ functionDeclarations: whiteboardToolDeclarations as any }]
        }
      });
    } catch (apiErr: any) {
      if (
        apiErr.message?.includes("API key") ||
        apiErr.message?.includes("API_KEY") ||
        apiErr.message?.includes("400") ||
        apiErr.message?.includes("INVALID_ARGUMENT")
      ) {
        isGeminiAvailable = false;
        return res.json({
          text: `Hello! I am ${agent.name} (${agent.role}). I reviewed your whiteboard notes!`,
          whiteboardActions: [
            {
              tool: "drawBoardText",
              payload: {
                x: 100,
                y: 100,
                content: `📝 Feedback from ${agent.name}:\nGreat practice! Keep going!`,
                fontSize: "m",
                color: "green"
              }
            }
          ]
        });
      }
      throw apiErr;
    }

    const whiteboardActions = (response.functionCalls || []).map((call: any) => ({
      tool: call.name,
      payload: call.args
    }));

    return res.json({
      text: response.text || "",
      whiteboardActions
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Service unavailable" });
  }
});

// Dedicated Text-to-Speech route using Gemini 3.8 Flash-Lite TTS with character prebuilt voices
app.post("/api/tts", async (req, res) => {
  try {
    const { text, agentId, voice } = req.body;
    const agent = TUTOR_AGENTS[agentId || "foundation"] || TUTOR_AGENTS.foundation;
    const voiceToUse = voice || agent.voice || "Puck";

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text string is required" });
    }

    if (!isGeminiAvailable) {
      return res.json({
        success: false,
        voice: voiceToUse,
        agentId: agent.id,
        error: "TTS_UNAVAILABLE"
      });
    }

    const audioBase64 = await generateTutorSpeech(text, voiceToUse, agent.gender);
    if (audioBase64) {
      return res.json({
        success: true,
        audioBase64,
        mimeType: "audio/wav",
        voice: voiceToUse,
        agentId: agent.id
      });
    }

    return res.json({
      success: false,
      voice: voiceToUse,
      agentId: agent.id,
      error: "TTS_UNAVAILABLE"
    });
  } catch (err: any) {
    return res.json({
      success: false,
      error: "TTS_UNAVAILABLE"
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`[Server] Antigravity backend & Vite running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
