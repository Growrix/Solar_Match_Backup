import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
        <div className="flex items-center space-x-1">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">AI is typing...</div>
      </div>
    </div>
  );
};

export default TypingIndicator;