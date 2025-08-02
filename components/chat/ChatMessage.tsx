import React, { useState } from 'react';
import { Copy, ThumbsUp, Bookmark, MoreVertical, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isError?: boolean;
  attachment?: {
    name: string;
    size: number;
    type: string;
  };
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // Here you could send feedback to your analytics
  };

  const handleSave = () => {
    setSaved(!saved);
    // Here you could save to local storage or user preferences
    const savedMessages = JSON.parse(localStorage.getItem('savedMessages') || '[]');
    if (!saved) {
      savedMessages.push(message);
      localStorage.setItem('savedMessages', JSON.stringify(savedMessages));
    } else {
      const filtered = savedMessages.filter((msg: Message) => msg.id !== message.id);
      localStorage.setItem('savedMessages', JSON.stringify(filtered));
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
        )}
        
        {/* Message Bubble */}
        <div className={`relative px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : message.isError 
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          
          {/* Attachment */}
          {message.attachment && (
            <div className="mb-2 p-2 bg-white/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/30 rounded flex items-center justify-center">
                  📎
                </div>
                <div>
                  <p className="text-sm font-medium">{message.attachment.name}</p>
                  <p className="text-xs opacity-75">
                    {(message.attachment.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Message Content */}
          <div className="prose prose-sm max-w-none">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    // Remove ref from props to avoid type error
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { ref, ...rest } = props;
                    return match ? (
                      <SyntaxHighlighter
                        style={tomorrow as any}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                        {...rest}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...rest}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs mt-2 ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
        
        {/* Action Buttons */}
        {!isUser && (
          <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
            
            <button
              onClick={handleLike}
              className={`p-1 rounded transition-colors ${
                liked ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Like message"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleSave}
              className={`p-1 rounded transition-colors ${
                saved ? 'text-yellow-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Save message"
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;