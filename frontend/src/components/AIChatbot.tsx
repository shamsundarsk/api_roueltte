import React, { useState, useRef, useEffect } from 'react';
import { useMashup } from '../context/MashupContext';
import { sendChatMessage, getChatbotStatus, getQuickHelp, ChatMessage } from '../services/chatbot.service';
import { RobotIcon, UserIcon, PackageIcon, KeyIcon, BugIcon, ClipboardIcon } from './Icons';
import './AIChatbot.css';

/**
 * Parse markdown-style formatting and convert to HTML
 */
const parseMarkdown = (text: string): string => {
  let html = text;
  
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Code: `code`
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br/>');
  
  return html;
};

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose }) => {
  const { mashupData } = useMashup();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check chatbot status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    try {
      const status = await getChatbotStatus();
      setIsConfigured(status.configured);
      if (!status.configured) {
        setError(status.message);
      }
    } catch (err) {
      setError('Unable to connect to chatbot service');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage({
        message: inputMessage,
        conversationHistory: messages,
        projectContext: mashupData || undefined,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the user message if sending failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickHelp = async (topic: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const help = await getQuickHelp(topic);
      
      const userMessage: ChatMessage = {
        role: 'user',
        content: `Help with: ${topic}`,
        timestamp: Date.now(),
      };

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: help,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
    } catch (err) {
      setError('Failed to load quick help');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div className="chatbot-title">
            <span className="chatbot-icon">
              <RobotIcon size={24} />
            </span>
            <h3>AI Project Assistant</h3>
            {mashupData && (
              <span className="chatbot-project-name">{mashupData.idea.appName}</span>
            )}
          </div>
          <div className="chatbot-actions">
            <button onClick={clearChat} className="chatbot-clear-btn" title="Clear chat">
              🗑️
            </button>
            <button onClick={onClose} className="chatbot-close-btn" title="Close">
              ✕
            </button>
          </div>
        </div>

        {!isConfigured && (
          <div className="chatbot-warning">
            ⚠️ AI chatbot requires configuration. Add your AI_API_KEY to backend/.env
          </div>
        )}

        <div className="chatbot-messages">
          {messages.length === 0 && (
            <div className="chatbot-welcome">
              <h4>👋 Hi! I'm your AI Project Assistant</h4>
              <p>I can help you with:</p>
              <ul>
                <li>Understanding the generated code</li>
                <li>Debugging errors and issues</li>
                <li>API integration guidance</li>
                <li>Setup and configuration</li>
                <li>Best practices and improvements</li>
              </ul>
              
              <div className="quick-help-buttons">
                <button onClick={() => handleQuickHelp('setup')}>
                  <PackageIcon size={16} /> Setup Guide
                </button>
                <button onClick={() => handleQuickHelp('api-keys')}>
                  <KeyIcon size={16} /> API Keys
                </button>
                <button onClick={() => handleQuickHelp('errors')}>
                  <BugIcon size={16} /> Common Errors
                </button>
                <button onClick={() => handleQuickHelp('structure')}>
                  <ClipboardIcon size={16} /> Project Structure
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`chatbot-message chatbot-message-${msg.role}`}>
              <div className="chatbot-message-avatar">
                {msg.role === 'user' ? <UserIcon size={20} /> : <RobotIcon size={20} />}
              </div>
              <div className="chatbot-message-content">
                {msg.role === 'assistant' ? (
                  <div 
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                  />
                ) : (
                  <div className="user-content">{msg.content}</div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chatbot-message chatbot-message-assistant">
              <div className="chatbot-message-avatar">
                <RobotIcon size={20} />
              </div>
              <div className="chatbot-message-content">
                <div className="chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="chatbot-error">
              ⚠️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConfigured ? "Ask me anything about your project..." : "Configure AI_API_KEY to use chatbot"}
            disabled={isLoading || !isConfigured}
            className="chatbot-input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !isConfigured}
            className="chatbot-send-btn"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
};
