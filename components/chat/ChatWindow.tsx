import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Download, 
  MoreVertical,
  Minimize2,
  Maximize2,
  MessageCircle
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import QuickActions from './QuickActions';
import { useChatHistory } from '../../hooks/useChatHistory';
import { useOpenAI } from '../../hooks/useOpenAI';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import ReactMarkdown from 'react-markdown';

interface ActionButton {
  label: string;
  action: string;
  style: 'primary' | 'secondary';
}

interface EnhancedMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  messageType?: 'general' | 'quote_summary' | 'bid_coach' | 'system_insight';
  suggestions?: string[];
  actionButtons?: ActionButton[];
  relatedQuotes?: string[];
  confidence?: number;
  isError?: boolean;
  attachment?: {
    name: string;
    size: number;
    type: string;
  };
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, addMessage, clearHistory, exportHistory } = useChatHistory();
  const { sendMessage, isLoading, error } = useOpenAI();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported 
  } = useSpeechRecognition();

  // Enhanced Chat Message Component
  const EnhancedChatMessage: React.FC<{
    message: any;
    onActionClick: (action: string) => void;
  }> = ({ message, onActionClick }) => {
    const getMessageIcon = () => {
      switch (message.messageType) {
        case 'quote_summary': return '📊';
        case 'bid_coach': return '🎯';
        case 'system_insight': return '💡';
        default: return '🤖';
      }
    };

    const getMessageStyle = () => {
      switch (message.messageType) {
        case 'quote_summary': return 'border-l-4 border-blue-500 bg-blue-50/10';
        case 'bid_coach': return 'border-l-4 border-green-500 bg-green-50/10';
        case 'system_insight': return 'border-l-4 border-purple-500 bg-purple-50/10';
        default: return '';
      }
    };

    return (
      <div className={`${getMessageStyle()} rounded-lg p-4 mb-4`}>
        {/* Message Header */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">{getMessageIcon()}</span>
          <span className="text-sm font-medium text-giants_orange-500">
            {message.messageType === 'quote_summary' && 'Quote Analysis'}
            {message.messageType === 'bid_coach' && 'Bid Coaching'}
            {message.messageType === 'system_insight' && 'System Insight'}
            {message.messageType === 'general' && 'Solar Assistant'}
          </span>
          {message.confidence && (
            <span className="text-xs text-battleship_gray-600">
              ({Math.round(message.confidence * 100)}% confidence)
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className="text-white mb-3">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Suggestions */}
        {message.suggestions && (
          <div className="mb-3">
            <p className="text-sm text-battleship_gray-600 mb-2">💭 You might also ask:</p>
            <div className="space-y-1">
              {message.suggestions.map((suggestion: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setMessage(suggestion)}
                  className="block w-full text-left text-sm text-blue-400 hover:text-blue-300 bg-onyx-600/30 hover:bg-onyx-600/50 rounded px-3 py-2 transition-colors"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {message.actionButtons && (
          <div className="flex flex-wrap gap-2">
            {message.actionButtons.map((button: ActionButton, index: number) => (
              <button
                key={index}
                onClick={() => onActionClick(button.action)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  button.style === 'primary'
                    ? 'bg-giants_orange-500 hover:bg-giants_orange-600 text-white'
                    : 'bg-onyx-600/50 hover:bg-onyx-600/70 text-white border border-onyx-600/30'
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>
        )}

        {/* Related Quotes */}
        {message.relatedQuotes && message.relatedQuotes.length > 0 && (
          <div className="mt-3 p-3 bg-onyx-600/20 rounded-lg">
            <p className="text-sm text-battleship_gray-600 mb-2">📋 Related to your quotes:</p>
            <div className="flex flex-wrap gap-2">
              {message.relatedQuotes.map((quoteId: string, index: number) => (
                <button
                  key={index}
                  onClick={() => onActionClick(`view_quote_${quoteId}`)}
                  className="text-xs bg-giants_orange-500/20 text-giants_orange-400 px-2 py-1 rounded hover:bg-giants_orange-500/30"
                >
                  Quote #{quoteId.slice(-6)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Action Handler
  const handleActionClick = (action: string) => {
    switch (action) {
      case 'navigate_quote_form':
        window.location.href = '/request-quote';
        break;
      case 'compare_quotes':
        window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'written-quotes' }));
        break;
      case 'view_bids':
        window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'bidding-room' }));
        break;
      default:
        if (action.startsWith('view_quote_')) {
          const quoteId = action.replace('view_quote_', '');
          console.log('View quote:', quoteId);
          // Navigate to quote details
        }
        break;
    }
    
    // Close chat after navigation
    onClose();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update message input with speech transcript
  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Event listener for AI chat message sending
  useEffect(() => {
    const handleAISendMessage = (event: any) => {
      setMessage(event.detail.message);
      setTimeout(() => handleSendMessage(), 100);
    };

    window.addEventListener('ai-chat-send-message', handleAISendMessage);
    
    return () => {
      window.removeEventListener('ai-chat-send-message', handleAISendMessage);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: message,
      role: 'user' as const,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setMessage('');
    setShowQuickActions(false);

    try {
      const response = await sendMessage(message, messages);
      
      if (response) {
        // Handle enhanced AI response
        const aiMessage = {
          id: Date.now().toString(),
          content: response.message,
          role: 'assistant' as const,
          timestamp: new Date(),
          messageType: response.messageType,
          suggestions: response.suggestions,
          actionButtons: response.actionButtons,
          relatedQuotes: response.relatedQuotes,
          confidence: response.confidence
        };

        addMessage(aiMessage);
      } else {
        throw new Error('No response received');
      }
    } catch {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant' as const,
        timestamp: new Date(),
        isError: true
      };
      addMessage(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Handle file upload logic here
    const fileMessage = {
      id: Date.now().toString(),
      content: `📎 Uploaded: ${file.name}`,
      role: 'user' as const,
      timestamp: new Date(),
      attachment: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };

    addMessage(fileMessage);
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
    setShowQuickActions(false);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed z-40 transition-all duration-300 ease-in-out chat-window ${
      isMinimized 
        ? 'bottom-6 right-6 w-80 h-16' 
        : 'bottom-4 right-4 w-full max-w-md h-[600px]'
    } max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]`}>
      
      <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl shadow-2xl border border-onyx-600/30 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-onyx-600/30 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white rounded-t-2xl flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 bg-white rounded-full flex-shrink-0"></div>
            </div>
            <div>
              <h3 className="font-semibold">Solar AI Assistant</h3>
              <p className="text-xs text-orange-100">Your solar energy expert</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            
            <div className="relative group">
              <button className="p-1 hover:bg-white/20 rounded transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 top-8 bg-night-500 text-white rounded-lg shadow-lg border border-onyx-600/30 py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <button
                  onClick={exportHistory}
                  className="w-full text-left px-4 py-2 hover:bg-onyx-500/50 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Chat</span>
                </button>
                <button
                  onClick={clearHistory}
                  className="w-full text-left px-4 py-2 hover:bg-onyx-500/50 text-red-400 flex items-center space-x-2"
                >
                  <span>Clear History</span>
                </button>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close chat"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <>
            {/* Messages and Quick Actions Container (scrollable) */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-4 space-y-4 bg-gradient-to-b from-night-500/50 to-black-500/50 flex-1">
                {messages.length === 0 ? (
                  <div className="text-center text-battleship_gray-700 mt-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2 text-white">Welcome to Solar AI Assistant</h4>
                    <p className="text-sm text-battleship_gray-700">Ask me anything about solar energy, rebates, or get help with your quotes!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    msg.role === 'assistant' && (msg as any).messageType ? (
                      <EnhancedChatMessage 
                        key={msg.id} 
                        message={msg} 
                        onActionClick={handleActionClick}
                      />
                    ) : (
                      <ChatMessage key={msg.id} message={msg} />
                    )
                  ))
                )}
                
                {isLoading && <TypingIndicator />}
                
                {error && (
                  <p className="text-red-400 text-sm">⚠️ {error}</p>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions (now inside the scrollable area) */}
              {showQuickActions && messages.length === 0 && ( /* Only show if no messages yet */
                <div className="flex-shrink-0">
                  <QuickActions onActionClick={handleQuickAction} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-onyx-600/30 p-4 bg-gradient-to-r from-night-500 to-black-500 rounded-b-2xl flex-shrink-0">
              <div className="flex items-end space-x-2">
                {/* File Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-battleship_gray-600 hover:text-giants_orange-500 hover:bg-onyx-500/30 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />

                {/* Message Input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-lg text-white placeholder-battleship_gray-600 focus:outline-none focus:ring-2 focus:ring-giants_orange-500 focus:border-transparent resize-none max-h-32"
                    rows={1}
                  />
                  
                  {/* Character count */}
                  {message.length > 0 && (
                    <div className="absolute bottom-1 right-2 text-xs text-battleship_gray-600">
                      {message.length}
                    </div>
                  )}
                </div>

                {/* Voice Input */}
                {isSupported && (
                  <button
                    onClick={handleVoiceToggle}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                      isListening 
                        ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30' 
                        : 'text-battleship_gray-600 hover:text-giants_orange-500 hover:bg-onyx-500/30'
                    }`}
                    aria-label={isListening ? 'Stop recording' : 'Start voice input'}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                )}

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="p-2 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white rounded-lg hover:from-giants_orange-600 hover:to-giants_orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              
              {/* Voice feedback */}
              {isListening && (
                <div className="mt-2 text-sm text-giants_orange-500 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;