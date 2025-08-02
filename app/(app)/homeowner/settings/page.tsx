import React from 'react'

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-battleship_gray-700">Manage your account preferences</p>
      </div>

      <div className="space-y-8">
        {/* Account Settings */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-battleship_gray-700 text-sm">Receive updates about your quotes</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-giants_orange-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">SMS Notifications</p>
                <p className="text-battleship_gray-700 text-sm">Get text updates for important events</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-onyx-600">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Share Data with Installers</p>
                <p className="text-battleship_gray-700 text-sm">Allow installers to see your energy usage data</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-giants_orange-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}