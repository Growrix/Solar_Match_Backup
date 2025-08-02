import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  FileText, 
  MessageSquare, 
  Globe, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface UserSettings {
  full_name: string;
  email: string;
  email_verified: boolean;
  phone: string;
  phone_verified: boolean;
  quote_module: 'call' | 'written' | 'both';
  accept_calls: boolean;
  language: string;
  timezone: string;
}

const SettingsSection: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    full_name: '',
    email: '',
    email_verified: false,
    phone: '',
    phone_verified: false,
    quote_module: 'both',
    accept_calls: true,
    language: 'en',
    timezone: 'Australia/Sydney'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Verification state
  const [verificationData, setVerificationData] = useState({
    phone: '',
    verificationCode: ''
  });
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user profile from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      // Set initial settings from profile data
      setSettings({
        full_name: data.full_name || user?.user_metadata?.full_name || '',
        email: data.email || user?.email || '',
        email_verified: true, // Assume email is verified through auth
        phone: data.phone || '',
        phone_verified: !!data.phone, // Simple check - in a real app, you'd have a specific flag
        quote_module: data.quote_module || 'both',
        accept_calls: data.accept_calls !== false, // Default to true if not set
        language: data.preferred_language || 'en',
        timezone: data.timezone || 'Australia/Sydney'
      });
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError('Failed to load your settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Special handling for quote_module
    if (field === 'quote_module' && value !== 'call' && value !== 'both') {
      // If switching away from call module, disable accept_calls
      setSettings(prev => ({ ...prev, [field]: value, accept_calls: false }));
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: settings.full_name,
          phone: settings.phone,
          quote_module: settings.quote_module,
          accept_calls: settings.accept_calls,
          preferred_language: settings.language,
          timezone: settings.timezone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      setSuccess('Settings updated successfully');
      setHasChanges(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    try {
      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      // Reset form and show success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setShowPasswordModal(false);
      setSuccess('Password updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError('Failed to update password. Please try again.');
    }
  };

  const handleSendVerification = async () => {
    try {
      setVerificationError(null);
      
      // Validate phone number
      if (!verificationData.phone) {
        setVerificationError('Please enter a phone number');
        return;
      }
      
      // In a real app, this would send an OTP to the phone number
      // For demo purposes, we'll just simulate it
      console.log('Sending verification code to:', verificationData.phone);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVerificationSent(true);
    } catch (err) {
      console.error('Error sending verification:', err);
      setVerificationError('Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyPhone = async () => {
    try {
      setVerificationError(null);
      
      // Validate verification code
      if (!verificationData.verificationCode) {
        setVerificationError('Please enter the verification code');
        return;
      }
      
      // In a real app, this would verify the OTP
      // For demo purposes, we'll just simulate it
      console.log('Verifying code:', verificationData.verificationCode);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update settings with verified phone
      setSettings(prev => ({
        ...prev,
        phone: verificationData.phone,
        phone_verified: true
      }));
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: verificationData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      setShowVerificationModal(false);
      setSuccess('Phone number verified successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error verifying phone:', err);
      setVerificationError('Failed to verify phone number. Please try again.');
    }
  };

  const handleVerifyNow = () => {
    setVerificationData({
      phone: settings.phone,
      verificationCode: ''
    });
    setVerificationSent(false);
    setVerificationError(null);
    setShowVerificationModal(true);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-battleship_gray-700">Manage your account preferences</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Personal Details */}
          <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={settings.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2 flex items-center space-x-2">
                  <span>Email Address</span>
                  {settings.email_verified && (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  value={settings.email}
                  readOnly
                  className="w-full bg-onyx-600/30 backdrop-blur-sm border border-onyx-600/20 rounded-xl px-4 py-3 text-battleship_gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-battleship_gray-600 mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2 flex items-center space-x-2">
                  <span>Phone Number</span>
                  {settings.phone_verified ? (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Unverified</span>
                    </span>
                  )}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    placeholder="Enter phone number"
                    readOnly={settings.phone_verified}
                  />
                  {!settings.phone_verified && settings.phone && (
                    <button
                      onClick={handleVerifyNow}
                      className="bg-giants_orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-giants_orange-600 transition-all whitespace-nowrap"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>

              {/* Password Change Button */}
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  Password
                </label>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full bg-onyx-600/50 text-white hover:bg-onyx-600/70 border border-onyx-600/30 rounded-xl px-4 py-3 font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Lock className="h-4 w-4" />
                  <span>Change Password</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quote Experience Preferences */}
          <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Quote Experience Preferences</span>
            </h3>
            
            <div className="space-y-6">
              {/* Quote Module Selection */}
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-4">
                  Which type of quotes would you like to receive?
                </label>
                <div className="space-y-3">
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      settings.quote_module === 'call' 
                        ? 'border-giants_orange-500 bg-giants_orange-500/10' 
                        : 'border-onyx-600/30 bg-onyx-600/20 hover:border-onyx-600/50'
                    }`}
                    onClick={() => handleInputChange('quote_module', 'call')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        settings.quote_module === 'call' 
                          ? 'border-giants_orange-500 bg-giants_orange-500' 
                          : 'border-onyx-600'
                      }`}></div>
                      <div>
                        <p className="text-white font-semibold">Call/Visit Only</p>
                        <p className="text-battleship_gray-700 text-sm">Installers can call you or schedule a site visit</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      settings.quote_module === 'written' 
                        ? 'border-giants_orange-500 bg-giants_orange-500/10' 
                        : 'border-onyx-600/30 bg-onyx-600/20 hover:border-onyx-600/50'
                    }`}
                    onClick={() => handleInputChange('quote_module', 'written')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        settings.quote_module === 'written' 
                          ? 'border-giants_orange-500 bg-giants_orange-500' 
                          : 'border-onyx-600'
                      }`}></div>
                      <div>
                        <p className="text-white font-semibold">Written Quotes Only</p>
                        <p className="text-battleship_gray-700 text-sm">Get detailed quotes without revealing contact info</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      settings.quote_module === 'both' 
                        ? 'border-giants_orange-500 bg-giants_orange-500/10' 
                        : 'border-onyx-600/30 bg-onyx-600/20 hover:border-onyx-600/50'
                    }`}
                    onClick={() => handleInputChange('quote_module', 'both')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        settings.quote_module === 'both' 
                          ? 'border-giants_orange-500 bg-giants_orange-500' 
                          : 'border-onyx-600'
                      }`}></div>
                      <div>
                        <p className="text-white font-semibold">Try Both</p>
                        <p className="text-battleship_gray-700 text-sm">Get both types of quotes for maximum options</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Call Permission Toggle (only if Call module is selected) */}
              {(settings.quote_module === 'call' || settings.quote_module === 'both') && (
                <div className="flex items-center justify-between p-4 bg-onyx-600/30 rounded-xl">
                  <div>
                    <p className="text-white font-semibold">Allow Installers to Call Me</p>
                    <p className="text-battleship_gray-700 text-sm">
                      When enabled, installers can contact you directly by phone
                    </p>
                  </div>
                  <button
                    onClick={() => handleInputChange('accept_calls', !settings.accept_calls)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.accept_calls ? 'bg-giants_orange-500' : 'bg-onyx-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.accept_calls ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}
              
              {/* Warning Message */}
              {settings.quote_module === 'call' && settings.accept_calls && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-yellow-300 text-sm">
                      Installers may now contact you directly by phone. Make sure your phone number is verified.
                    </p>
                  </div>
                </div>
              )}
              
              {settings.quote_module === 'written' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-300 text-sm">
                      You'll only receive written quotes. Your contact information will not be shared with installers.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Language & Timezone */}
          <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Language & Timezone</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language */}
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="zh">Chinese</option>
                  <option value="vi">Vietnamese</option>
                  <option value="ar">Arabic</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              
              {/* Timezone */}
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                >
                  <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                  <option value="Australia/Melbourne">Melbourne (AEST/AEDT)</option>
                  <option value="Australia/Brisbane">Brisbane (AEST)</option>
                  <option value="Australia/Adelaide">Adelaide (ACST/ACDT)</option>
                  <option value="Australia/Perth">Perth (AWST)</option>
                  <option value="Australia/Darwin">Darwin (ACST)</option>
                  <option value="Australia/Hobart">Hobart (AEST/AEDT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Change Password</h3>
              <p className="text-battleship_gray-700">
                Update your password to keep your account secure
              </p>
            </div>
            
            {passwordError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{passwordError}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 pr-10 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    placeholder="Enter current password"
                    required
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
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 pr-10 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    placeholder="Enter new password"
                    required
                    minLength={6}
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
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 pr-10 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
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
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-onyx-600/50 text-battleship_gray-700 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phone Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verify Phone Number</h3>
              <p className="text-battleship_gray-700">
                We'll send a verification code to your phone
              </p>
            </div>
            
            {verificationError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{verificationError}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              {!verificationSent ? (
                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    Phone Number
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="tel"
                      value={verificationData.phone}
                      onChange={(e) => setVerificationData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                      placeholder="Enter phone number"
                    />
                    <button
                      onClick={handleSendVerification}
                      className="bg-giants_orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-giants_orange-600 transition-all whitespace-nowrap"
                    >
                      Send Code
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationData.verificationCode}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, verificationCode: e.target.value }))}
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    placeholder="Enter verification code"
                  />
                  <p className="text-xs text-battleship_gray-600 mt-2">
                    A verification code has been sent to {verificationData.phone}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 bg-onyx-600/50 text-battleship_gray-700 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
              >
                Cancel
              </button>
              {verificationSent ? (
                <button
                  onClick={handleVerifyPhone}
                  className="flex-1 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all"
                >
                  Verify Phone
                </button>
              ) : (
                <button
                  onClick={handleSendVerification}
                  className="flex-1 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all"
                >
                  Send Verification Code
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsSection;