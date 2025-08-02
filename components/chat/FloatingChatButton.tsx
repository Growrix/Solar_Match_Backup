import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnreadMessages?: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ 
  isOpen, 
  onClick, 
  hasUnreadMessages = false 
}) => {
  // Don't render the button when chat is open
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-giants_orange-500/30 z-50 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 hover:from-giants_orange-600 hover:to-giants_orange-700 animate-bounce-subtle`}
      aria-label="Open Solar AI assistant"
    >
      {/* Pulse animation for unread messages */}
      {hasUnreadMessages && (
        <div className="absolute inset-0 rounded-full bg-giants_orange-400 animate-ping opacity-75"></div>
      )}
      
      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center w-full h-full text-white">
        <MessageCircle className="h-6 w-6" />
      </div>
      
      {/* Notification badge */}
      {hasUnreadMessages && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
    </button>
  );
};

export default FloatingChatButton;