'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NextLink from 'next/link';
import { 
  Gavel, 
  Briefcase, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Scale, 
  Users, 
  Building2, 
  Clock, 
  Search, 
  PlusCircle,
  FileCheck
} from 'lucide-react';

interface AuthUser {
  userId: number;
  email: string;
  name: string;
  role: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const deniedParam = searchParams.get('denied');
  const deniedModule = searchParams.get('module');

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeRole, setActiveRole] = useState<'ADMIN' | 'JUDGE' | 'LAWYER' | 'CLERK'>('JUDGE');
  const [loading, setLoading] = useState(true);
  const [adjudicationResult, setAdjudicationResult] = useState<any>(null);
  const [adjudicating, setAdjudicating] = useState(false);

  const handleAdjudicate = async (bailId: number, decision: 'GRANTED' | 'REJECTED') => {
    setAdjudicating(true);
    try {
      const res = await fetch('/api/bail/adjudicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bailId,
          decision,
          reasoning: decision === 'GRANTED'
            ? 'Investigation completed, charge sheet filed; continuous detention violates Article 21 precedent under Satender Kumar Antil v. CBI.'
            : 'Severity of non-bailable economic charge and flight risk warrants continued judicial detention.',
          suretyAmount: decision === 'GRANTED' ? 50000 : 0,
        }),
      });
      const data = await res.json();
      setAdjudicationResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAdjudicating(false);
    }
  };

  // Fetch the authenticated user profile from /api/auth/me
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            const userRole = data.user.role.toUpperCase();
            if (['ADMIN', 'JUDGE', 'LAWYER', 'CLERK'].includes(userRole)) {
              setActiveRole(userRole as any);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load session profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Resolving judicial role session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Access Denied Alert (from Middleware) */}
      {deniedParam === '1' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-amber-800">
              Access Restricted
            </h4>
            <p className="mt-0.5">
              Your assigned role ({currentUser?.role || 'Current Role'}) does not have authorization to access module{' '}
              <code className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold">{deniedModule || 'requested'}</code>.
              You have been safely redirected to your authorized workspace.
            </p>
          </div>
        </div>
      )}

      {/* Role Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <span>Official Judicial Session</span>
            <span>•</span>
            <span className="font-mono">{currentUser?.email || 'Authenticated User'}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            {activeRole === 'JUDGE' && 'Judicial Bench Dashboard'}
            {activeRole === 'LAWYER' && 'Advocate & Counsel Workspace'}
            {activeRole === 'ADMIN' && 'Court Administration Master Console'}
            {activeRole === 'CLERK' && 'Court Registry & Listings Desk'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as: <strong className="text-slate-200">{currentUser?.name || 'Authorized Officer'}</strong> ({currentUser?.role || activeRole})
          </p>
        </div>

        {/* If user is ADMIN, allow administrative view switching between roles */}
        {currentUser?.role === 'ADMIN' && (
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
            {(['ADMIN', 'JUDGE', 'LAWYER', 'CLERK'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeRole === r ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                {r} View
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. JUDGE DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {activeRole === 'JUDGE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Pending Bail Petitions</span>
                <Scale className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1">2 Petitions</p>
              <span className="text-[11px] text-amber-600 font-medium">Court Hall 2 • Listed for Today</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Upcoming Hearings</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-blue-600 mt-1">4 Hearings</p>
              <span className="text-[11px] text-slate-500 font-medium">Verified by trg_prevent_judge_conflict</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Disposal Clearance Rate</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-1">87.5%</p>
              <span className="text-[11px] text-slate-500 font-medium">Calculated via vw_judge_caseload_metrics</span>
            </div>
          </div>

          {/* Pending Bail Adjudications Action Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            {adjudicationResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs text-emerald-900">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-800">
                    ✓ {adjudicationResult.procedureExecuted} Executed Successfully
                  </span>
                  <button onClick={() => setAdjudicationResult(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <p><strong>Outcome Pronounced:</strong> <span className="font-mono font-bold">{adjudicationResult.decision}</span> (Surety: ₹{adjudicationResult.suretyAmount})</p>
                <p><strong>Database Trigger:</strong> <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">{adjudicationResult.triggerExecuted}</code></p>
                <p className="text-[11px] text-emerald-700">Database Engine: <strong>{adjudicationResult.storageBackend}</strong></p>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Pending Bail Adjudications (Action Required)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Execute stored procedure <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">sp_adjudicate_bail</code> to pronounce rulings.
                </p>
              </div>
              <NextLink
                href="/bail/intelligence"
                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-100 transition"
              >
                Launch Precedent Matcher →
              </NextLink>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">CNR-KA-BLR-2026-00101</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Risk Index: 35.0
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mt-1">
                    State of Karnataka v. Vikram Malhotra (Sec 420 IPC, 66D IT Act)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Applicant in custody for 45 days. Complete charge sheet filed; digital evidence frozen.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <NextLink
                    href="/bail/intelligence"
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
                  >
                    View Precedents
                  </NextLink>
                  <button
                    disabled={adjudicating}
                    onClick={() => handleAdjudicate(1, 'GRANTED')}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow disabled:opacity-50"
                  >
                    {adjudicating ? 'Executing SP...' : 'Grant Bail'}
                  </button>
                  <button
                    disabled={adjudicating}
                    onClick={() => handleAdjudicate(1, 'REJECTED')}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-500 transition shadow disabled:opacity-50"
                  >
                    {adjudicating ? 'Executing SP...' : 'Reject Bail'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LAWYER / ADVOCATE DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {activeRole === 'LAWYER' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Advocate Counsel Practice Console
                </h2>
                <p className="text-xs text-slate-500">
                  Active Legal Counsel: {currentUser?.name || 'Advocate Shanthi / Shriranjini'} (Bar Council of Karnataka)
                </p>
              </div>
              <NextLink
                href="/bail/apply"
                className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-400 transition shadow flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Draft New Bail Petition</span>
              </NextLink>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-xs font-bold uppercase">Active Client Matters</span>
                  <Briefcase className="w-4 h-4 text-slate-500" />
                </div>
                <p className="text-xl font-bold text-slate-900 mt-1">3 Active Matters</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Vikram Malhotra (Cyber Sec 420), Priya Deshmukh (Contract Sec 406)
                </p>
                <div className="mt-3">
                  <NextLink href="/cases" className="text-xs text-blue-600 font-bold hover:underline">
                    View Case Registry & Transcripts →
                  </NextLink>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-xs font-bold uppercase">AI Precedent Search Engine</span>
                  <Search className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xl font-bold text-purple-700 mt-1">pgvector Semantic Match</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Match grounds against Supreme Court judgments (*Satender Kumar Antil*, *Arnesh Kumar*)
                </p>
                <div className="mt-3">
                  <NextLink href="/bail/intelligence" className="text-xs text-purple-700 font-bold hover:underline">
                    Evaluate Legal Grounds with AI →
                  </NextLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CLERK / REGISTRAR DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {activeRole === 'CLERK' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Pending CNR Listings</span>
                <FileCheck className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1">3 Cases</p>
              <span className="text-[11px] text-slate-500 font-medium">Assigned to Court Halls 1 & 2</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Scheduled Hearings</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-1">4 Listed</p>
              <span className="text-[11px] text-emerald-600 font-medium">Collision Guard Active (45m)</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Registry Clearance</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-1">100%</p>
              <span className="text-[11px] text-slate-500 font-medium">All cause lists published</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Court Registry & Roster Management
                </h2>
                <p className="text-xs text-slate-500">
                  Manage CNR cause lists, check judge calendar availability, and register case documents.
                </p>
              </div>
              <NextLink
                href="/cases"
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
              >
                Inspect Registry Table →
              </NextLink>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Registry Responsibilities & Permissions:
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                <li>Register new CNR entries into the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">cases</code> table.</li>
                <li>Schedule hearing timestamps verified by database trigger <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">trg_prevent_judge_conflict</code>.</li>
                <li>Upload certified FIR copies and charge sheet transcripts to the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">documents</code> table.</li>
                <li className="text-amber-800 font-medium">Note: Bail petition filing and judicial adjudication are restricted to Advocates and Judges.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADMIN DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {activeRole === 'ADMIN' && (
        <div className="space-y-6">
          {/* Master Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <Building2 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-500 uppercase">Courts</span>
              <p className="text-2xl font-black text-slate-900 mt-1">3</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <Gavel className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-500 uppercase">Active Judges</span>
              <p className="text-2xl font-black text-slate-900 mt-1">3</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <FileText className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-500 uppercase">Law Sections</span>
              <p className="text-2xl font-black text-slate-900 mt-1">6</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <Scale className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-500 uppercase">Precedents</span>
              <p className="text-2xl font-black text-slate-900 mt-1">4</p>
            </div>
          </div>

          {/* User & Role Management Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  User & Role-Based Access Control (RBAC) Management
                </h2>
                <p className="text-xs text-slate-500">
                  Provisioned system accounts mapped to database roles in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">users</code> and <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">roles</code> tables.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                System Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-2.5 px-3">User ID</th>
                    <th className="py-2.5 px-3">Full Legal Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Database Role</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  <tr>
                    <td className="py-2.5 px-3 font-mono">1</td>
                    <td className="py-2.5 px-3 font-medium">System Admin</td>
                    <td className="py-2.5 px-3 text-slate-600">admin@jurispredict.gov.in</td>
                    <td className="py-2.5 px-3 font-bold text-purple-700">ADMIN</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">ACTIVE</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono">2</td>
                    <td className="py-2.5 px-3 font-medium">Hon. Justice Rajesh Sharma</td>
                    <td className="py-2.5 px-3 text-slate-600">judge.sharma@karnatakacourts.gov.in</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">JUDGE</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">ACTIVE</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono">4</td>
                    <td className="py-2.5 px-3 font-medium">Adv. Shantheni Shenoy</td>
                    <td className="py-2.5 px-3 text-slate-600">shantheni.adv@barcouncil.org</td>
                    <td className="py-2.5 px-3 font-bold text-amber-700">ADVOCATE (LAWYER)</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">ACTIVE</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono">6</td>
                    <td className="py-2.5 px-3 font-medium">Ramesh Babu (Registrar)</td>
                    <td className="py-2.5 px-3 text-slate-600">registry.blr@karnatakacourts.gov.in</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">REGISTRAR (CLERK)</td>
                    <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">ACTIVE</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoleDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Loading judicial workspace...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
