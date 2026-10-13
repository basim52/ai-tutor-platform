import { useState, useEffect, useRef, useCallback } from 'react';
import { TUTOR_AGENTS, TutorAgentConfig } from '../../agents';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  imageBase64?: string | null;
  agentName?: string;
}

export function useTutorSocket(selectedAgentId: string = 'foundation') {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeVoice, setActiveVoice] = useState<string>('Puck');
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    setStatus('connecting');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setSocket(ws);

    ws.onopen = () => {
      setStatus('connected');
      // Start session with selected agent
      ws.send(JSON.stringify({
        type: 'START_SESSION',
        agentId: selectedAgentId,
      }));
    };

    ws.onclose = () => {
      setStatus('disconnected');
      setIsLoading(false);
      setSocket(null);
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          connect();
        }
      }, 3000);
    };

    ws.onerror = (err) => {
      console.warn('AI Tutor WebSocket connection warning:', err);
      setStatus('disconnected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'SESSION_STARTED') {
          console.log(`[Session Started] Agent: ${data.agentName} (${data.role})`);
          if (data.voice) setActiveVoice(data.voice);
        } else if (data.type === 'AGENT_RESPONSE') {
          setIsLoading(false);
          const currentAgent = TUTOR_AGENTS[selectedAgentId] || TUTOR_AGENTS.foundation;
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              role: 'model',
              content: data.text || '',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              agentName: currentAgent.name,
            },
          ]);
        } else if (data.type === 'ERROR') {
          setIsLoading(false);
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              role: 'model',
              content: `⚠️ Server Error: ${data.error}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch (e) {
        console.error('Error handling WebSocket message:', e);
      }
    };
  }, [selectedAgentId]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  // When selected agent changes, inform server
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'START_SESSION',
        agentId: selectedAgentId,
      }));
    }
  }, [selectedAgentId]);

  const sendUserMessage = ({
    text,
    imageBase64,
  }: {
    text: string;
    imageBase64?: string | null;
  }) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return false;
    }

    const currentAgent = TUTOR_AGENTS[selectedAgentId] || TUTOR_AGENTS.foundation;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageBase64: imageBase64 || null,
      agentName: currentAgent.name,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    wsRef.current.send(
      JSON.stringify({
        type: 'USER_MESSAGE',
        text,
        imageBase64: imageBase64 || undefined,
      })
    );

    return true;
  };

  const clearChat = () => {
    setMessages([]);
    setIsLoading(false);
  };

  return {
    socket,
    status,
    messages,
    isLoading,
    activeVoice,
    sendUserMessage,
    clearChat,
  };
}
