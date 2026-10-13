import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { TUTOR_AGENTS } from "./agents";
import { whiteboardToolDeclarations } from "./tools";

dotenv.config();

const port = parseInt(process.env.PORT || "8080", 10);
const wss = new WebSocketServer({ port });
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey && apiKey !== "your_gemini_api_key_here" ? new GoogleGenAI({ apiKey }) : null;

console.log(`[Server] Antigravity backend running on ws://localhost:${port}`);

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
          voice: agent.voice
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

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contentsPayload,
          config: {
            systemInstruction: agent.systemInstruction,
            tools: [{ functionDeclarations: whiteboardToolDeclarations as any }]
          }
        });

        // تنفيذ استدعاءات السبورة التفاعلية
        if (response.functionCalls && response.functionCalls.length > 0) {
          for (const call of response.functionCalls) {
            ws.send(JSON.stringify({
              type: "WHITEBOARD_ACTION",
              tool: call.name,
              payload: call.args
            }));
          }
        }

        // إرسال الرد النصي للمحادثة
        if (response.text) {
          ws.send(JSON.stringify({
            type: "AGENT_RESPONSE",
            text: response.text
          }));
        }
      }
    } catch (err: any) {
      console.error("[Error]", err.message);
      ws.send(JSON.stringify({ type: "ERROR", error: err.message }));
    }
  });
});

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
  }

  ws.send(JSON.stringify({
    type: "AGENT_RESPONSE",
    text: `Hello! I am ${agent.name} (${agent.role}). I reviewed your message and updated the whiteboard. (Running in demo mode - set GEMINI_API_KEY in .env for live Gemini 2.5 Flash responses).`
  }));
}
