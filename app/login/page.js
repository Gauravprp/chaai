'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, Mail, Lock, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Multiple accounts handling state
  const [companyId, setCompanyId] = useState('');
  const [showCompanyField, setShowCompanyField] = useState(false);

  const handleCredentialResponse = async (response) => {
    setGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle(response.credential);
      router.push('/workspace');
    } catch (err) {
      setError("Google authentication failed: " + err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const triggerGoogleLogin = () => {
    if (typeof window !== 'undefined' && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: '1074127027415-google-dyzo-auth.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });
        // Display Google Sign-In prompt/One Tap
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If prompt is blocked, run fallback simulated login
            handleGoogleLogin();
          }
        });
      } catch (err) {
        handleGoogleLogin();
      }
    } else {
      handleGoogleLogin();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password, showCompanyField ? companyId : null);
      router.push('/workspace');
    } catch (err) {
      setError(err.message || "Invalid login credentials.");
      if (err.message && (err.message.includes('company_id') || err.message.includes('Multiple accounts'))) {
        setShowCompanyField(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await loginWithGoogle('dyzo_google_auth_token_mock');
      router.push('/workspace');
    } catch (err) {
      setError("Google Login failed: " + err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotSuccess(false);
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });
      
      const data = await response.json();
      if (data.status !== 1) {
        throw new Error(data.message || data.error || 'Failed to send reset email');
      }
      
      setForgotSuccess(true);
      setForgotEmail('');
    } catch (err) {
      alert("Reset Error: " + err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-200/40 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 mb-2">
            <Compass size={28} className="animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Welcome back</h1>
          <p className="text-xs text-slate-400">Sign in to sync your teams and start collaborating instantly.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 smooth-transition"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotSuccess(false);
                  setShowForgotModal(true);
                }}
                className="text-[11px] text-indigo-600 font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 smooth-transition"
                required
              />
            </div>
          </div>

          {showCompanyField && (
            <div className="space-y-1 animate-fade-in">
              <label className="text-xs font-bold text-rose-500 uppercase tracking-wider block">Company ID</label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="Specify company_id"
                className="w-full px-3 py-2 border border-rose-300 rounded-xl text-sm bg-rose-50/30 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 smooth-transition"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl text-sm smooth-transition shadow-lg shadow-indigo-600/10"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="absolute bg-white px-3 text-xs text-slate-400 font-semibold uppercase">Or</span>
        </div>

        {/* Continue with Google button */}
        <button
          onClick={triggerGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 smooth-transition shadow-sm"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.38c0,-0.67 -0.06,-1.31 -0.17,-1.9z" fill="#4285F4" />
              <path d="M12,20.58c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.91,0.61 -2.08,0.98 -3.3,0.98c-2.34,0 -4.32,-1.58 -5.02,-3.7H2.94v2.66c1.49,2.96 4.55,4.94 8.06,4.94z" fill="#34A853" />
              <path d="M6.98,13.08c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.02H2.94C2.33,8.23 2,9.6 2,11c0,1.4 0.33,2.77 0.94,3.98l4.04,-3.9z" fill="#FBBC05" />
              <path d="M12,4.82c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,2.15 14.42,1.42 12,1.42c-3.51,0 -6.57,1.98 -8.06,4.94l4.04,3.12c0.7,-2.12 2.68,-3.7 5.02,-3.7z" fill="#EA4335" />
            </g>
          </svg>
          <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
            Sign up now
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="text-indigo-600" size={20} />
              <h3 className="text-base font-bold text-slate-800">Reset Password</h3>
            </div>
            
            {forgotSuccess ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  We've sent a password reset link to your email address. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold smooth-transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your email address and we'll email you a link to reset your password.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border border-slate-200 p-2.5 rounded-lg text-xs focus:outline-none focus:border-indigo-600"
                  required
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
