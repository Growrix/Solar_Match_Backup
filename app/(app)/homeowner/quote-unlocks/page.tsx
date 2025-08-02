import React from 'react'

export default function QuoteUnlocksPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Quote Unlocks</h2>
        <p className="text-battleship_gray-700">Manage your quote requests and unlock more options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Call/Visit Quotes */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4">Call/Visit Quote Requests</h3>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-battleship_gray-700 text-sm">Quotes Used: 0/3</span>
              <span className="text-battleship_gray-700 text-sm">3 remaining</span>
            </div>
            <div className="w-full h-3 bg-onyx-600/50 rounded-full">
              <div className="h-3 bg-blue-500 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all">
            Request Call/Visit Quote
          </button>
        </div>

        {/* Written Quotes */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4">Written Quote Requests</h3>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-battleship_gray-700 text-sm">Quotes Used: 0/3</span>
              <span className="text-battleship_gray-700 text-sm">3 remaining</span>
            </div>
            <div className="w-full h-3 bg-onyx-600/50 rounded-full">
              <div className="h-3 bg-green-500 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all">
            Request Written Quote
          </button>
        </div>
      </div>
    </div>
  )
}