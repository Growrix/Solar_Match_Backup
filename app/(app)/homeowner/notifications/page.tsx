import React from 'react'

export default function NotificationsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Notifications</h2>
        <p className="text-battleship_gray-700">Stay updated on important events</p>
      </div>

      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 text-center">
        <div className="w-16 h-16 bg-onyx-600/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-battleship_gray-600 text-2xl">🔔</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
        <p className="text-battleship_gray-700">
          Your notifications will appear here when you have activity on your quotes.
        </p>
      </div>
    </div>
  )
}