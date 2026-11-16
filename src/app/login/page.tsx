'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Shield, AlertCircle, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activePreFill, setActivePreFill] = useState<string | null>(null);

  // Validate callbackUrl to prevent open-redirect vulnerabilities
  const getSafeRedirectUrl = (url: string): string => {
    if (url && url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    return '/dashboard';
  };

  const quickFillRole = (roleEmail: string, roleKey: string) => {
    setEmail(roleEmail);
    setPassword('Password@123');
    setActivePreFill(roleKey);
    setErrorMessage('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid official email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(data?.error || 'Authentication failed. Please verify your credentials.');
        setIsLoading(false);
        return;
      }

      // Successful authentication
      const destination = getSafeRedirectUrl(callbackUrl);
      router.push(destination);
      router.refresh();
    } catch (error) {
      console.error('Login network error:', error);
      setErrorMessage('Network error: Unable to reach the authentication service.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Card Header */}
      <div className="bg-slate-900 text-white p-8 text-center border-b border-slate-800 relative">
        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
          <Shield className="w-6 h-6 text-slate-950" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Juris<span className="text-amber-400">Predict</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
          Legal Case & Bail Intelligence Portal
        </p>
      </div>

      {/* Login Form */}
      <div className="p-8 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Judicial Sign In</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Authenticate to access your assigned court division and case dossiers.
          </p>
        </div>

        {/* Quick One-Click Demo Role Selector */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <span>⚡ Quick Demo Credentials:</span>
            <span className="text-[10px] text-amber-600 font-semibold">Click to select role</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickFillRole('judge.sharma@karnatakacourts.gov.in', 'JUDGE')}
              className={`p-2 text-left rounded-lg border transition cursor-pointer ${
                activePreFill === 'JUDGE'
                  ? 'bg-amber-100 border-amber-500 font-bold shadow-sm'
                  : 'bg-white hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <span>⚖️</span> <span>Judge</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">Hon. Justice Sharma</div>
            </button>

            <button
              type="button"
              onClick={() => quickFillRole('shantheni.adv@barcouncil.org', 'LAWYER')}
              className={`p-2 text-left rounded-lg border transition cursor-pointer ${
                activePreFill === 'LAWYER'
                  ? 'bg-amber-100 border-amber-500 font-bold shadow-sm'
                  : 'bg-white hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <span>💼</span> <span>Lawyer</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">Adv. Shantheni Shenoy</div>
            </button>

            <button
              type="button"
              onClick={() => quickFillRole('registry.blr@karnatakacourts.gov.in', 'CLERK')}
              className={`p-2 text-left rounded-lg border transition cursor-pointer ${
                activePreFill === 'CLERK'
                  ? 'bg-amber-100 border-amber-500 font-bold shadow-sm'
                  : 'bg-white hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <span>📜</span> <span>Clerk</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">Ramesh Babu (Registry)</div>
            </button>

            <button
              type="button"
              onClick={() => quickFillRole('admin@jurispredict.gov.in', 'ADMIN')}
              className={`p-2 text-left rounded-lg border transition cursor-pointer ${
                activePreFill === 'ADMIN'
                  ? 'bg-amber-100 border-amber-500 font-bold shadow-sm'
                  : 'bg-white hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <span>🛡️</span> <span>Admin</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">System Administrator</div>
            </button>
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="name@court.gov.in"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setActivePreFill(null);
                }}
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to System</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </>
            )}
          </button>
        </form>

        {/* Security & Roles Footer */}
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Supported Roles:</span>
            <span className="font-mono text-slate-600">Judge • Lawyer • Clerk • Admin</span>
          </div>
          <div className="pt-1 flex justify-between items-center text-xs">
            <span className="text-slate-600">New official or counsel?</span>
            <Link href="/register" className="text-amber-600 hover:text-amber-700 font-bold underline">
              Register New Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-8">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center text-xs text-slate-500">
            Loading authentication portal...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
