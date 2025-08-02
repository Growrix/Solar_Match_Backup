import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, Building, CheckCircle, AlertCircle, Shield, AlertTriangle } from 'lucide-react';
import { signInInstaller } from '@/lib/utils/auth';
import { supabase } from '@/lib/supabase';

interface InstallerSignInProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InstallerSignIn: React.FC<InstallerSignInProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate Google OAuth for installers
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Google sign-in successful! Redirecting to installer dashboard...');
      setTimeout(() => {
        onSuccess();
        window.location.href = '/installer/dashboard';
      }, 2000);
    } catch (err: any) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      // Sign in user
      const { data: authData, error: authError } = await signInInstaller({
        email: formData.email.trim(),
        password: formData.password
      });

      if (authError) throw authError;

      if (authData.user) {
        // Check if user is an installer
        const { data: isInstaller, error: checkError } = await supabase
          .rpc('check_installer_user', { user_id: authData.user.id });

        if (checkError) {
          throw new Error('Error verifying installer status');
        }

        if (!isInstaller) {
          throw new Error('This account is not registered as an installer. Please use the regular sign-in or create an installer account.');
        }

        // Set installer flag and remember me preference
        localStorage.setItem('user_type', 'installer');
        if (rememberMe) {
          localStorage.setItem('installer_remember_me', 'true');
        }

        setSuccess('Signed in successfully! Redirecting to dashboard...');
        setTimeout(() => {
          onSuccess();
          window.location.href = '/installer/dashboard';
        }, 1500);
      }
    } catch (err: any) {
      // Only log unexpected errors to console, not user credential errors
      if (!err.message?.includes('Invalid login credentials') && 
          !err.message?.includes('invalid_credentials') &&
          !err.message?.includes('Email not confirmed') &&
          !err.message?.includes('not registered as an installer') &&
          !err.message?.includes('Invalid email')) {
        console.error('Unexpected installer authentication error:', err);
      } else {
        console.warn('Installer authentication failed:', err.message);
      }
      
      // Handle specific error cases with user-friendly messages
      if (err.message?.includes('Invalid login credentials') || err.message?.includes('invalid_credentials')) {
        setError('The email or password you entered is incorrect. Please check your credentials and try again.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else if (err.message?.includes('not registered as an installer')) {
        setError('This account is not registered as an installer. Please use the regular sign-in or create an installer account.');
      } else if (err.message?.includes('Invalid email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address first, then click "Forgot password?"');
      return;
    }
    
    // Implement forgot password functionality
    setSuccess('If an installer account with this email exists, you will receive a password reset link shortly.');
    setError(null);
  };

  const resetForm = () => {
    setFormData({ email: '', password: '' });
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setRememberMe(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Building className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Installer Partner Sign In
          </h2>
          <p className="text-battleship_gray-700 text-sm">
            Access your installer dashboard and manage leads
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium mb-1">Authentication Error</p>
                <p className="text-red-300 text-sm">{error}</p>
                {error.includes('incorrect') && (
                  <button
                    onClick={handleForgotPassword}
                    className="text-red-400 hover:text-red-300 text-sm underline mt-2 transition-colors"
                  >
                    Forgot your password?
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-onyx-500/50 hover:bg-onyx-500/70 border border-onyx-600/30 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-onyx-600/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-gradient-to-r from-night-500 to-black-500 text-battleship_gray-700">or</span>
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Business email address"
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-battleship_gray-600 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-giants_orange-500 bg-onyx-600/50 border-onyx-600/30 rounded focus:ring-giants_orange-500 focus:ring-2"
              />
              <span className="text-sm text-battleship_gray-700">Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-giants_orange-500 hover:text-giants_orange-400 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 hover:from-giants_orange-600 hover:to-giants_orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* 2FA Notice */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 font-semibold text-sm">Enhanced Security</span>
          </div>
          <p className="text-blue-300 text-xs">
            Two-factor authentication (2FA) is available in your dashboard settings for additional account security.
          </p>
        </div>

        {/* Support Link */}
        <div className="mt-6 text-center">
          <p className="text-battleship_gray-700 text-sm">
            Need help accessing your account?{' '}
            <a href="#" className="text-giants_orange-500 hover:text-giants_orange-400 underline transition-colors">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstallerSignIn;