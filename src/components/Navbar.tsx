'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, LogIn, Shield } from 'lucide-react';

interface AuthUser {
  userId: number;
  email: string;
  name: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check current session from /api/auth/me
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
          } else {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setCurrentUser(null);
      router.push('/login');
      router.refresh();
    }
  };

  const userRole = currentUser?.role?.toUpperCase();

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <Link href={currentUser ? "/dashboard" : "/login"} className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 shadow group-hover:bg-amber-400 transition">
              JP
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-amber-400 transition">
                JurisPredict
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold text-slate-400 border border-slate-700 px-2 py-0.5 rounded tracking-wider">
                DBMS Level 3
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items based on Authentication & Role */}
        <nav className="flex items-center space-x-5 text-sm font-medium">
          {currentUser ? (
            <>
              {/* Universal for authenticated users */}
              <Link
                href="/dashboard"
                className={`transition ${
                  pathname.startsWith('/dashboard')
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Dashboard
              </Link>

              {/* Case Registry: All roles */}
              <Link
                href="/cases"
                className={`transition ${
                  pathname.startsWith('/cases')
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Case Registry
              </Link>

              {/* AI Bail Intelligence: Admin, Judge, Lawyer */}
              {userRole && ['ADMIN', 'JUDGE', 'LAWYER'].includes(userRole) && (
                <Link
                  href="/bail/intelligence"
                  className={`transition ${
                    pathname.startsWith('/bail/intelligence')
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-300 hover:text-amber-300'
                  }`}
                >
                  AI Bail Intelligence
                </Link>
              )}

              {/* File Bail Petition: Admin, Lawyer */}
              {userRole && ['ADMIN', 'LAWYER'].includes(userRole) && (
                <Link
                  href="/bail/apply"
                  className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-amber-400 transition shadow"
                >
                  + File Bail
                </Link>
              )}

              {/* Project Specs & Architecture */}
              <Link
                href="/overview"
                className={`transition ${
                  pathname.startsWith('/overview')
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Project Specs
              </Link>

              {/* Authenticated User Badge & Logout */}
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                    {currentUser.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out of Session"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 text-xs font-semibold border border-slate-700 hover:border-red-900/60 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Unauthenticated View: Focused Sign In */}
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs transition shadow cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Judicial Sign In</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
