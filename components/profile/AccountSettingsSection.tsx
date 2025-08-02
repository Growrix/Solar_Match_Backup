import React, { useState } from 'react';
import { Lock, Bell, Shield, Eye, EyeOff, Smartphone, Mail, MessageSquare } from 'lucide-react';

interface AccountSettingsSectionProps {
  onChange: () => void;
}

const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({ onChange }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailQuotes: true,
    emailUpdates: true,
    emailMarketing: false,
    smsQuotes: false,
    smsUpdates: false,
    pushNotifications: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analyticsOptOut: false
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    onChange();
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    onChange();
  };

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    onChange();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // Handle password change logic here
    console.log('Password change submitted');
    onChange();
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    onChange();
  };

  return (
    <div className="space-y-8">
      {/* Password Change */}
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Lock className="h-5 w-5" />
          <span>Change Password</span>
        </h3>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Password */}
            <div className="md:col-span-2">
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-battleship_gray-600 hover:text-white transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-battleship_gray-600 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-battleship_gray-600 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Two-Factor Authentication</span>
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-semibold mb-2">Enable 2FA</h4>
            <p className="text-battleship_gray-700 text-sm">
              Add an extra layer of security to your account with two-factor authentication.
            </p>
          </div>
          <button
            onClick={handleTwoFactorToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              twoFactorEnabled ? 'bg-giants_orange-500' : 'bg-onyx-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="mt-6 p-4 bg-onyx-600/30 rounded-xl border border-onyx-600/20">
            <div className="flex items-center space-x-3 mb-3">
              <Smartphone className="h-5 w-5 text-giants_orange-500" />
              <span className="text-white font-semibold">Authenticator App</span>
            </div>
            <p className="text-battleship_gray-700 text-sm">
              Use an authenticator app like Google Authenticator or Authy to generate verification codes.
            </p>
            <button className="mt-3 bg-giants_orange-500/20 text-giants_orange-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-giants_orange-500/30 transition-colors">
              Setup Authenticator
            </button>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notification Preferences</span>
        </h3>
        
        <div className="space-y-6">
          {/* Email Notifications */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email Notifications</span>
            </h4>
            <div className="space-y-3">
              {[
                { key: 'emailQuotes', label: 'Solar quote updates', description: 'Get notified when you receive new quotes' },
                { key: 'emailUpdates', label: 'Account updates', description: 'Important updates about your account' },
                { key: 'emailMarketing', label: 'Marketing emails', description: 'Solar tips, news, and promotional content' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-battleship_gray-700 text-sm">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(item.key, !notifications[item.key as keyof typeof notifications])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications[item.key as keyof typeof notifications] ? 'bg-giants_orange-500' : 'bg-onyx-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SMS Notifications */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>SMS Notifications</span>
            </h4>
            <div className="space-y-3">
              {[
                { key: 'smsQuotes', label: 'Quote alerts', description: 'SMS alerts for new solar quotes' },
                { key: 'smsUpdates', label: 'Account alerts', description: 'Critical account security updates' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-battleship_gray-700 text-sm">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(item.key, !notifications[item.key as keyof typeof notifications])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications[item.key as keyof typeof notifications] ? 'bg-giants_orange-500' : 'bg-onyx-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Privacy Settings</span>
        </h3>
        
        <div className="space-y-6">
          {/* Profile Visibility */}
          <div>
            <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
              Profile Visibility
            </label>
            <select
              value={privacy.profileVisibility}
              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
            >
              <option value="private" className="bg-onyx-600 text-white">Private</option>
              <option value="public" className="bg-onyx-600 text-white">Public</option>
            </select>
            <p className="text-battleship_gray-700 text-sm mt-1">
              Control who can see your profile information
            </p>
          </div>

          {/* Data Sharing */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Data Sharing</p>
              <p className="text-battleship_gray-700 text-sm">
                Allow sharing anonymized data to improve our services
              </p>
            </div>
            <button
              onClick={() => handlePrivacyChange('dataSharing', !privacy.dataSharing)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.dataSharing ? 'bg-giants_orange-500' : 'bg-onyx-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Analytics Opt-out */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Analytics Opt-out</p>
              <p className="text-battleship_gray-700 text-sm">
                Opt out of website analytics and tracking
              </p>
            </div>
            <button
              onClick={() => handlePrivacyChange('analyticsOptOut', !privacy.analyticsOptOut)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.analyticsOptOut ? 'bg-giants_orange-500' : 'bg-onyx-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.analyticsOptOut ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsSection;