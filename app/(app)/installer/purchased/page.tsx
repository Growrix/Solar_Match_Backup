import React from 'react'

export default function PurchasedLeadsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Purchased Leads</h2>
        <p className="text-battleship_gray-700">Manage and track your purchased leads</p>
      </div>

      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 text-center">
        <div className="w-16 w-16 bg-onyx-600/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <div className="h-10 w-10 text-battleship_gray-600">📋</div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Purchased Leads</h3>
        <p className="text-battleship_gray-700 mb-6">
          You haven't purchased any leads yet. Visit the Lead Feed to find and purchase leads.
        </p>
        <button className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105">
          Browse Lead Feed
        </button>
      </div>
    </div>
  )
}