import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, MapPin, Sprout, ShoppingCart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  defaultRole?: 'buyer' | 'seller';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  defaultRole = 'buyer',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [role, setRole] = useState<'buyer' | 'seller'>(defaultRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { login, register } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.success) {
          onClose();
          if (onSuccess) onSuccess();
        } else {
          setErrorMessage(result.error || 'Invalid email or password.');
        }
      } else if (mode === 'register') {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name or farm name.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setIsSubmitting(false);
          return;
        }

        const result = await register({
          name,
          email,
          password,
          role,
          phone,
          location,
          address,
        });

        if (result.success) {
          onClose();
          if (onSuccess) onSuccess();
        } else {
          setErrorMessage(result.error || 'Failed to create account.');
        }
      } else if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        setResetSent(true);
        showToast(data.message, 'info');
      }
    } catch (err: any) {
      setErrorMessage('An unexpected network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoRole: 'seller' | 'buyer') => {
    setIsSubmitting(true);
    setErrorMessage('');
    const demoEmail = demoRole === 'seller' ? 'farmer@farmlink.com' : 'buyer@farmlink.com';
    const demoPass = demoRole === 'seller' ? 'farmer123' : 'buyer123';

    setEmail(demoEmail);
    setPassword(demoPass);

    const result = await login(demoEmail, demoPass);
    setIsSubmitting(false);
    if (result.success) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(result.error || 'Demo login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
        {/* Top Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">FarmLink Access</span>
            <h3 className="text-lg font-bold text-stone-900 mt-0.5">
              {mode === 'login' ? 'Sign In to Your Account' : mode === 'register' ? 'Join FarmLink Marketplace' : 'Reset Password'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Logins Bar */}
        {mode === 'login' && (
          <div className="px-6 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-emerald-900 font-medium">Quick 1-Click Demo:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('seller')}
                className="px-2.5 py-1 bg-emerald-800 text-white rounded font-medium hover:bg-emerald-900 transition-colors shadow-xs"
              >
                Farmer Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('buyer')}
                className="px-2.5 py-1 bg-white text-emerald-950 border border-emerald-300 rounded font-medium hover:bg-emerald-100 transition-colors"
              >
                Buyer Demo
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {mode === 'forgot' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {resetSent ? (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                  <p className="text-xs font-semibold text-emerald-900">Instructions Dispatched</p>
                  <p className="text-xs text-emerald-800">
                    If an account is associated with {email}, you will receive password recovery instructions shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setResetSent(false);
                    }}
                    className="text-xs font-semibold text-emerald-950 underline mt-2"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-stone-600">
                    Enter your account email address and we will provide a verified password reset link.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@farmlink.com"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Sending Request...' : 'Send Recovery Instructions'}
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-stone-500 hover:text-stone-800"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selector during Register */}
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-700">I am joining as a:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        role === 'buyer'
                          ? 'border-emerald-700 bg-emerald-50/60 ring-1 ring-emerald-700'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-stone-900">Produce Buyer</div>
                        <div className="text-[10px] text-stone-500 leading-tight mt-0.5">Household or wholesale culinary buyer</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        role === 'seller'
                          ? 'border-emerald-700 bg-emerald-50/60 ring-1 ring-emerald-700'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <Sprout className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-stone-900">Farmer / Grower</div>
                        <div className="text-[10px] text-stone-500 leading-tight mt-0.5">Sell directly with transparent pricing</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name (if registering) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    {role === 'seller' ? 'Farmer Name or Farm Business' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={role === 'seller' ? 'e.g. Green Meadows Organic Farm' : 'e.g. Jane Doe'}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@farmlink.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-stone-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-emerald-800 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Registration Extra Fields */}
              {mode === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-8 pr-2 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      {role === 'seller' ? 'Farm Location' : 'City / Area'}
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Eldoret Valley"
                        className="w-full pl-8 pr-2 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : mode === 'login' ? (
                  <>
                    Sign In
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Create {role === 'seller' ? 'Farmer' : 'Buyer'} Account
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Switch Mode */}
              <div className="text-center pt-2 text-xs text-stone-600">
                {mode === 'login' ? (
                  <p>
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="font-semibold text-emerald-800 hover:underline"
                    >
                      Create one here
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-semibold text-emerald-800 hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
