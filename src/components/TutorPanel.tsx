import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../hooks/useTutorSocket';
import { TUTOR_AGENTS, TutorAgentConfig } from '../../agents';

interface TutorPanelProps {
  status: 'connected' | 'connecting' | 'disconnected';
  messages: ChatMessage[];
  isLoading: boolean;
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
  onSend: (prompt: string, includeCanvas: boolean) => void;
  onAddNoteToCanvas: (text: string) => void;
  onClearChat: () => void;
}

const AGENT_AVATARS: Record<string, string> = {
  foundation: '📖',
  free_talk: '💬',
  business_pro: '💼',
  ielts_examiner: '🎯',
  phonetics: '🗣️',
  roleplay: '🎭',
};

export const TutorPanel: React.FC<TutorPanelProps> = ({
  status,
  messages,
  isLoading,
  selectedAgentId,
  onSelectAgent,
  onSend,
  onAddNoteToCanvas,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [includeCanvas, setIncludeCanvas] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentAgent: TutorAgentConfig = TUTOR_AGENTS[selectedAgentId] || TUTOR_AGENTS.foundation;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !includeCanvas) return;

    onSend(inputText || 'Please review my whiteboard.', includeCanvas);
    setInputText('');
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text
      .replace(/[*#_`$]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="tutor-panel">
      {/* Panel Top Header */}
      <div className="tutor-header">
        <div className="tutor-branding">
          <div className="tutor-avatar">{AGENT_AVATARS[currentAgent.id] || '🧑‍🏫'}</div>
          <div>
            <h2 className="tutor-title">{currentAgent.name}</h2>
            <div className="tutor-status-row">
              <span className={`status-dot ${status}`} />
              <span className="status-text">
                {currentAgent.role} • Voice: <strong>{currentAgent.voice}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="tutor-agent-select">
          <select
            value={selectedAgentId}
            onChange={(e) => onSelectAgent(e.target.value)}
            className="agent-dropdown"
          >
            {Object.values(TUTOR_AGENTS).map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tutor Persona Description Banner */}
      <div className="agent-role-banner">
        <span className="banner-badge">{currentAgent.role}</span>
        <span className="banner-instruction">
          {currentAgent.systemInstruction.slice(0, 110)}...
        </span>
      </div>

      {/* Action Shortcut Bar */}
      <div className="action-button-row">
        <button
          onClick={() => onSend('Analyze my whiteboard notes and provide constructive guidance.', true)}
          disabled={isLoading}
          className="btn-action primary"
          title="Inspect the whiteboard canvas with Gemini vision"
        >
          🔍 Inspect Board
        </button>
        <button
          onClick={() => onSend('Give me a helpful hint on what to practice or correct next.', true)}
          disabled={isLoading}
          className="btn-action secondary"
          title="Get a hint without spoiling the solution"
        >
          💡 Next Hint
        </button>
        <button
          onClick={() => onSend('Check my language and grammar on the whiteboard and highlight any errors.', true)}
          disabled={isLoading}
          className="btn-action tertiary"
          title="Check work for errors"
        >
          ✅ Check My Work
        </button>
      </div>

      {/* Conversation Stream */}
      <div className="tutor-chat-history">
        {messages.length === 0 && !isLoading && (
          <div className="chat-placeholder">
            <div className="placeholder-icon">{AGENT_AVATARS[currentAgent.id] || '🎨'}</div>
            <h3>Session with {currentAgent.name}</h3>
            <p>
              Write sentences, idioms, or questions on the board, then click <strong>Inspect Board</strong>. Your tutor will write feedback and corrections directly on the canvas!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message-card ${msg.role}`}>
            <div className="message-header">
              <span className="role-tag">
                {msg.role === 'user' ? '🧑 Student' : `🤖 ${msg.agentName || currentAgent.name}`}
              </span>
              <span className="message-time">{msg.timestamp}</span>
            </div>

            {msg.imageBase64 && (
              <div className="attached-thumbnail-container">
                <span className="thumbnail-badge">Captured Board Snapshot:</span>
                <img src={msg.imageBase64} alt="Whiteboard snapshot" className="attached-thumbnail" />
              </div>
            )}

            <div className="message-content">
              {msg.content}
            </div>

            {msg.role === 'model' && (
              <div className="message-tools">
                <button
                  onClick={() => handleSpeak(msg.content)}
                  className="tool-btn"
                  title="Read aloud"
                >
                  {isSpeaking ? '⏹️ Stop' : `🔊 Listen (${currentAgent.voice})`}
                </button>
                <button
                  onClick={() => onAddNoteToCanvas(msg.content)}
                  className="tool-btn"
                  title="Pin this feedback onto the canvas as a sticky note"
                >
                  📌 Pin to Whiteboard
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message-card model streaming">
            <div className="message-header">
              <span className="role-tag">🤖 {currentAgent.name} is thinking & writing...</span>
            </div>
            <div className="message-content">
              <span className="typing-dots">Examining whiteboard & executing tools<span>.</span><span>.</span><span>.</span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box and Controls */}
      <form onSubmit={handleSubmit} className="tutor-input-area">
        <div className="input-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeCanvas}
              onChange={(e) => setIncludeCanvas(e.target.checked)}
            />
            <span>Include Whiteboard Snapshot</span>
          </label>
          {messages.length > 0 && (
            <button type="button" onClick={onClearChat} className="clear-chat-btn">
              Clear History
            </button>
          )}
        </div>

        <div className="input-row">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={includeCanvas ? `Ask ${currentAgent.name} about your whiteboard...` : `Speak with ${currentAgent.name}...`}
            disabled={isLoading}
            className="chat-input-field"
          />
          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && !includeCanvas)}
            className="send-button"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};
