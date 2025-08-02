import React from 'react'

export default function ChatPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Chat</h2>
        <p className="text-battleship_gray-700">Communicate with installers about your quotes</p>
      </div>

      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 text-center">
        <div className="w-16 h-16 bg-onyx-600/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-battleship_gray-600 text-2xl">💬</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Active Conversations</h3>
        <p className="text-battleship_gray-700 mb-6">
          Your chat conversations with installers will appear here.
        </p>
        <button className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105">
          View My Quotes
        </button>
      </div>
    </div>
  )
}