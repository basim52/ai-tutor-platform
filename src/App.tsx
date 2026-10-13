import React, { useState, useEffect, useRef } from "react";
import { Whiteboard } from "./Whiteboard";

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

const AGENTS: Agent[] = [
  { id: "foundation", name: "Adam", role: "Grammar & Basics", avatar: "📖" },
  { id: "free_talk", name: "Sarah", role: "Casual & Idioms", avatar: "💬" },
  { id: "business_pro", name: "David", role: "Business & Interviews", avatar: "💼" },
  { id: "ielts_examiner", name: "Victoria", role: "IELTS Examiner", avatar: "🎯" },
  { id: "phonetics", name: "Liam", role: "Pronunciation", avatar: "🗣️" },
  { id: "roleplay", name: "Elena", role: "Real-world Scenarios", avatar: "🎭" }
];

export const App: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string>("foundation");
  const [messages, setMessages] = useState<{ sender: "user" | "agent"; text: string }[]>([]);
  const [inputVal, setInputVal] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    socketRef.current = ws;
    setSocket(ws);

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "START_SESSION", agentId: selectedAgent }));
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "AGENT_RESPONSE") {
          setIsTyping(false);
          setMessages((prev) => [...prev, { sender: "agent", text: data.text }]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const switchAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    setMessages([]);
    setIsTyping(false);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "START_SESSION", agentId }));
    }
  };

  const handleSend = () => {
    if (!inputVal.trim() || !socketRef.current) return;
    const text = inputVal.trim();
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInputVal("");
    setIsTyping(true);
    socketRef.current.send(JSON.stringify({ type: "USER_MESSAGE", text }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const currentAgent = AGENTS.find((a) => a.id === selectedAgent) || AGENTS[0];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Inter, system-ui, -apple-system, sans-serif", overflow: "hidden", backgroundColor: "#0f172a" }}>
      {/* القائمة الجانبية: اختيار الوكيل والمحادثة */}
      <aside
        style={{
          width: "420px",
          minWidth: "360px",
          backgroundColor: "#111827",
          borderRight: "1px solid #1f2937",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          zIndex: 10,
        }}
      >
        {/* رأس الشريط الجانبي */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1f2937", backgroundColor: "#131d2e" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#f9fafb" }}>
              🎓 AI Tutor Platform
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: isConnected ? "#10b981" : "#ef4444",
                  boxShadow: isConnected ? "0 0 8px #10b981" : "none",
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                {isConnected ? "Connected" : "Connecting..."}
              </span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>
            Active Coach: <strong style={{ color: "#60a5fa" }}>{currentAgent.name}</strong> ({currentAgent.role})
          </p>
        </div>

        {/* قائمة اختيار المعلم / الوكيل */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1f2937", backgroundColor: "#0f172a" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>
            Select AI Tutor Specialist:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {AGENTS.map((agent) => {
              const isSelected = agent.id === selectedAgent;
              return (
                <button
                  key={agent.id}
                  onClick={() => switchAgent(agent.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: isSelected ? "1px solid #3b82f6" : "1px solid #1f2937",
                    backgroundColor: isSelected ? "#1e3a8a" : "#1e293b",
                    color: isSelected ? "#ffffff" : "#cbd5e1",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{agent.avatar}</span>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: isSelected ? "#93c5fd" : "#94a3b8", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {agent.role}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* سجل المحادثة */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                margin: "auto 0",
                textAlign: "center",
                padding: "24px 16px",
                border: "1px dashed #374151",
                borderRadius: "12px",
                color: "#9ca3af",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{currentAgent.avatar}</div>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "0.95rem", color: "#f3f4f6" }}>
                Session with {currentAgent.name}
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", lineHeight: 1.5 }}>
                Write your sentence, ask a question, or practice speaking. {currentAgent.name} will explain concepts and update the whiteboard canvas in real-time!
              </p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={index}
                style={{
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: isUser ? "#2563eb" : "#1f2937",
                  color: isUser ? "#ffffff" : "#f3f4f6",
                  fontSize: "0.86rem",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginBottom: "4px",
                    color: isUser ? "#bfdbfe" : "#93c5fd",
                  }}
                >
                  {isUser ? "You" : currentAgent.name}
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
              </div>
            );
          })}

          {isTyping && (
            <div
              style={{
                alignSelf: "flex-start",
                padding: "8px 12px",
                borderRadius: "8px",
                backgroundColor: "#1f2937",
                color: "#93c5fd",
                fontSize: "0.78rem",
              }}
            >
              🤖 {currentAgent.name} is thinking & writing on board...
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* حقل إدخال الرسالة */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid #1f2937", backgroundColor: "#111827" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${currentAgent.name}...`}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #374151",
                backgroundColor: "#1f2937",
                color: "#f9fafb",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputVal.trim()}
              style={{
                padding: "0 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: inputVal.trim() ? "#2563eb" : "#374151",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: inputVal.trim() ? "pointer" : "not-allowed",
                transition: "background-color 0.15s ease",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </aside>

      {/* لوحة الرسم / السبورة التفاعلية */}
      <main style={{ flex: 1, height: "100%", position: "relative", backgroundColor: "#ffffff" }}>
        <Whiteboard socket={socket} />
      </main>
    </div>
  );
};

export default App;

