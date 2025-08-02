import { useState, useEffect } from 'react';

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

export const useChatHistory = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Load chat history from localStorage on mount (but only if it exists)
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to load chat history:', error);
        // Clear corrupted data
        localStorage.removeItem('chatHistory');
      }
    }
  }, []);

  // Save to localStorage whenever messages change (but only if there are messages)
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('chatHistory', JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    }
  }, [messages]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('lastChatReadTime');
  };

  const exportHistory = () => {
    if (messages.length === 0) {
      alert('No chat history to export');
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        ...(msg.attachment && { attachment: msg.attachment })
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-chat-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    messages,
    addMessage,
    clearHistory,
    exportHistory
  };
};