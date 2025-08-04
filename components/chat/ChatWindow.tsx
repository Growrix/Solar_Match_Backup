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
      const response = await sendMessage(message);
      
      // Ensure aiMessage.content is a string
      const aiMessage = {
        id: Date.now().toString(),
        content: response || '', // Default to an empty string if null
        role: 'assistant' as const,
        timestamp: new Date()
      };

      addMessage(aiMessage);
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
                    <ChatMessage key={msg.id} message={msg} />
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