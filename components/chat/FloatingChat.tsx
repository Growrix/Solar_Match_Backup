import React, { useState, useEffect } from 'react';
import FloatingChatButton from './FloatingChatButton';
import ChatWindow from './ChatWindow';

const FloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [chatKey, setChatKey] = useState(0); // Key to force chat reset

  // Check for unread messages on mount
  useEffect(() => {
    const lastReadTime = localStorage.getItem('lastChatReadTime');
    const chatHistory = localStorage.getItem('chatHistory');
    
    if (chatHistory && lastReadTime) {
      try {
        const messages = JSON.parse(chatHistory);
        const lastRead = new Date(lastReadTime);
        const hasUnread = messages.some((msg: any) => 
          msg.role === 'assistant' && new Date(msg.timestamp) > lastRead
        );
        setHasUnreadMessages(hasUnread);
      } catch (error) {
        console.error('Error checking unread messages:', error);
      }
    }
  }, []);

  const handleToggleChat = () => {
    if (isOpen) {
      // Closing chat - clear history and reset for next session
      localStorage.removeItem('chatHistory');
      localStorage.removeItem('lastChatReadTime');
      setChatKey(prev => prev + 1); // Force new chat instance
      setIsOpen(false);
    } else {
      // Opening chat
      setIsOpen(true);
      setHasUnreadMessages(false);
      localStorage.setItem('lastChatReadTime', new Date().toISOString());
    }
  };

  return (
    <>
      <FloatingChatButton
        isOpen={isOpen}
        onClick={handleToggleChat}
        hasUnreadMessages={hasUnreadMessages}
      />
      
      <ChatWindow
        key={chatKey} // This forces a fresh chat instance each time
        isOpen={isOpen}
        onClose={handleToggleChat}
      />
    </>
  );
};

export default FloatingChat;