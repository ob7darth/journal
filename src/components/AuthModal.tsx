import React, { useState } from 'react';
import { X, User, Mail, Lock, UserPlus, LogIn, Users } from 'lucide-react';
import { supabaseAuthService as authService } from '../services/SupabaseAuthService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup' | 'guest' | 'upgrade';
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode: initialMode, onSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      switch (mode) {
        case 'guest':
          if (!formData.name.trim()) {
            throw new Error('Please enter your name');
          }
          await authService.signInAsGuest(formData.name);
          break;

        case 'signup':
          if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
            throw new Error('Please fill in all fields');
          }
          if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
          }
          if (formData.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }
          await authService.signUp(formData.email, formData.password, formData.name);
          break;

        case 'signin':
          if (!formData.email.trim() || !formData.password) {
            throw new Error('Please enter email and password');
          }
          await authService.signIn(formData.email, formData.password);
          break;

        case 'upgrade':
          if (!formData.email.trim() || !formData.password) {
            throw new Error('Please enter email and password');
          }
          if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
          }
          if (formData.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }
          await authService.upgradeToMember(formData.email, formData.password);
          break;
      }

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  if (!isOpen) return null;

  const getTitle = () => {
    switch (mode) {
      case 'guest': return 'Continue as Guest';
      case 'signup': return 'Create Account';
      case 'signin': return 'Sign In';
      case 'upgrade': return 'Upgrade to Member Account';
      default: return 'Authentication';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'guest': return <Users size={24} />;
      case 'signup': return <UserPlus size={24} />;
      case 'signin': return <LogIn size={24} />;
      case 'upgrade': return <UserPlus size={24} />;
      default: return <User size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                {getIcon()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            {mode === 'guest' && (
              <p className="text-gray-600">
                Start your devotional journey immediately. Your entries will be saved locally on this device.
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-gray-600">
                Create a member account to sync your devotions across all your devices and never lose your spiritual journey.
              </p>
            )}
            {mode === 'signin' && (
              <p className="text-gray-600">
                Welcome back! Sign in to access your devotions from any device.
              </p>
            )}
            {mode === 'upgrade' && (
              <p className="text-gray-600">
                Upgrade to a member account to sync your devotions across devices and backup your spiritual journey.
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field */}
            {(mode === 'guest' || mode === 'signup') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            {(mode === 'signup' || mode === 'signin' || mode === 'upgrade') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password field */}
            {(mode === 'signup' || mode === 'signin' || mode === 'upgrade') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
                {(mode === 'signup' || mode === 'upgrade') && (
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                )}
              </div>
            )}

            {/* Confirm Password field */}
            {(mode === 'signup' || mode === 'upgrade') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {getIcon()}
                  {mode === 'guest' && 'Continue as Guest'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'upgrade' && 'Upgrade Account'}
                </>
              )}
            </button>
          </form>

          {/* Mode switching */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            {mode === 'guest' && (
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Already have an account?</p>
                <button
                  onClick={() => setMode('signin')}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Sign In Instead
                </button>
              </div>
            )}

            {mode === 'signin' && (
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Don't have an account?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setMode('signup')}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Create Account
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setMode('guest')}
                    className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Already have an account?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setMode('signin')}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Sign In
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setMode('guest')}
                    className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Benefits */}
          {mode !== 'upgrade' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                {mode === 'guest' ? 'Guest Mode Benefits:' : 'Member Benefits:'}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {mode === 'guest' ? (
                  <>
                    <li>• Start immediately, no signup required</li>
                    <li>• All features available locally</li>
                    <li>• Upgrade to member account anytime</li>
                  </>
                ) : (
                  <>
                    <li>• Sync across all your devices</li>
                    <li>• Automatic cloud backup</li>
                    <li>• Never lose your spiritual journey</li>
                    <li>• Enhanced sharing features</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;