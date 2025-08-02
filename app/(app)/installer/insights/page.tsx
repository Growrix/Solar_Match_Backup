import React from 'react'

export default function InsightsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Lead Insights</h2>
        <p className="text-battleship_gray-700">Analytics and performance metrics for your leads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Purchased Leads</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-blue-400">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">25%</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <span className="text-green-400">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-white">$850</p>
            </div>
            <div className="w-12 h-12 bg-giants_orange-500/20 rounded-xl flex items-center justify-center">
              <span className="text-giants_orange-500">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Avg. Lead Quality</p>
              <p className="text-2xl font-bold text-white">8.2</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="text-purple-400">⭐</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Detailed Analytics Coming Soon</h3>
        <p className="text-battleship_gray-700">
          Advanced lead performance analytics and insights will be available here.
        </p>
      </div>
    </div>
  )
}