import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { signUpHomeowner, signInHomeowner } from '@/lib/utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) {
      setError(null);
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

    if (mode === 'signup' && !formData.fullName.trim()) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { error } = await signUpHomeowner({
          email: formData.email.trim(),
          password: formData.password,
          fullName: formData.fullName.trim()
        });

        if (error) throw error;
        setSuccess('Account created successfully! Please check your email to verify your account.');
      } else {
        const { error } = await signInHomeowner({
          email: formData.email.trim(),
          password: formData.password
        });

        if (error) throw error;
        setSuccess('Signed in successfully!');
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // Handle specific error cases with user-friendly messages
      if (err.message?.includes('Invalid login credentials') || err.message?.includes('invalid_credentials')) {
        setError('The email or password you entered is incorrect. Please check your credentials and try again.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else if (err.message?.includes('User already registered') || err.message?.includes('user_already_exists')) {
        setError('This email is already registered. Please sign in or use a different email address.');
      } else if (err.message?.includes('not registered as a homeowner')) {
        setError('This account is not registered as a homeowner. Please use the installer sign-in if you have an installer account.');
      } else if (err.message?.includes('Invalid email')) {
        setError('Please enter a valid email address.');
      } else if (err.message?.includes('Password should be at least')) {
        setError('Password must be at least 6 characters long.');
      } else if (err.message?.includes('Signup requires a valid password')) {
        setError('Please enter a valid password (at least 6 characters).');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Note: This would need to be implemented with actual Google OAuth
      // For now, we'll show a placeholder
      setError('Google sign-in will be implemented with OAuth configuration');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
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
    setSuccess('If an account with this email exists, you will receive a password reset link shortly.');
    setError(null);
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', fullName: '' });
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <div className="w-10 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-6 h-4 bg-gradient-to-br from-night-500 to-black-500 rounded"></div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-battleship_gray-700 text-sm">
            {mode === 'signin' 
              ? 'Sign in to access your solar quotes and preferences' 
              : 'Join thousands of Australians who have gone solar with us'
            }
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
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
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

          {/* Form Fields */}
          {mode === 'signup' && (
            <div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Full name"
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                required
              />
            </div>
          )}

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-battleship_gray-600 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Forgot Password Link for Sign In */}
          {mode === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-giants_orange-500 hover:text-giants_orange-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 hover:from-giants_orange-600 hover:to-giants_orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Please wait...</span>
              </div>
            ) : (
              mode === 'signin' ? 'Sign in' : 'Create Account'
            )}
          </button>
        </form>

        {/* Terms and Privacy */}
        {mode === 'signup' && (
          <div className="mt-6 text-center">
            <p className="text-xs text-battleship_gray-700">
              By creating an account, you agree to SolarMatch's{' '}
              <a href="#" className="text-giants_orange-500 hover:text-giants_orange-400 underline transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-giants_orange-500 hover:text-giants_orange-400 underline transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        )}

        {/* Switch Mode */}
        <div className="mt-8 text-center">
          <p className="text-battleship_gray-700 text-sm">
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={switchMode}
              className="text-giants_orange-500 hover:text-giants_orange-400 font-medium ml-1 transition-colors underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Installer Link */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
          <p className="text-blue-300 text-sm">
            Are you a solar installer?{' '}
            <button
              onClick={() => {
                onClose();
                // Trigger installer eligibility form
                setTimeout(() => {
                  const event = new CustomEvent('open-installer-eligibility');
                  window.dispatchEvent(event);
                }, 100);
              }}
              className="text-blue-400 hover:text-blue-300 underline font-medium"
            >
              Join our partner network
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;