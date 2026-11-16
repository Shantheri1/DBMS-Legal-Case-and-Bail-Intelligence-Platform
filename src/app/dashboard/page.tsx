'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
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
  FileCheck,
  CheckCircle2,
  XCircle,
  Award
} from 'lucide-react';

interface AuthUser {
  userId: number;
  email: string;
  name: string;
  role: string;
}

interface BailPetition {
  bailId: number;
  caseId: number;
  caseNumber: string;
  caseTitle: string;
  applicantName: string;
  courtName: string;
  bailType: string;
  grounds: string;
  custodyDays: number;
  riskScore: number;
  status: 'PENDING' | 'GRANTED' | 'REJECTED';
  appliedDate: string;
  appliedByAdvocate?: string;
  decision?: string;
  decisionDate?: string;
  suretyAmount?: number;
  reasoning?: string;
  adjudicatedByJudge?: string;
}

interface CaseItem {
  id: number;
  caseNumber: string;
  title: string;
  court: string;
  accused: string;
  filingDate: string;
  priority: string;
  status: string;
  charges: string;
  lastAdjudication?: {
    decision: string;
    decisionDate: string;
    suretyAmount: number;
    reasoning: string;
    judgeName: string;
  };
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const deniedParam = searchParams.get('denied');
  const deniedModule = searchParams.get('module');

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeRole, setActiveRole] = useState<'ADMIN' | 'JUDGE' | 'LAWYER' | 'CLERK'>('JUDGE');
  const [loading, setLoading] = useState(true);
  const [adjudicationResult, setAdjudicationResult] = useState<any>(null);
  const [adjudicatingId, setAdjudicatingId] = useState<number | null>(null);

  // Live state synchronized with relational case store
  const [allPetitions, setAllPetitions] = useState<BailPetition[]>([]);
  const [pendingPetitions, setPendingPetitions] = useState<BailPetition[]>([]);
  const [adjudicatedPetitions, setAdjudicatedPetitions] = useState<BailPetition[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch live petitions and cases
  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [petRes, casesRes] = await Promise.all([
        fetch('/api/bail/petitions'),
        fetch('/api/cases'),
      ]);

      if (petRes.ok) {
        const petData = await petRes.json();
        setAllPetitions(petData.all || []);
        setPendingPetitions(petData.pending || []);
        setAdjudicatedPetitions(petData.adjudicated || []);
      }

      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(casesData.cases || []);
      }
    } catch (err) {
      console.error('Failed to load petitions and cases:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const handleAdjudicate = async (bailId: number, decision: 'GRANTED' | 'REJECTED') => {
    setAdjudicatingId(bailId);
    try {
      const res = await fetch('/api/bail/adjudicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bailId,
          decision,
          reasoning: decision === 'GRANTED'
            ? 'Investigation substantially completed; custody no longer indispensable for trial progression. Bail granted under Article 21 precedent (Satender Kumar Antil v. CBI).'
            : 'Severity of invoked economic offences, flight risk, and potential witness interference warrant continued judicial detention.',
          suretyAmount: decision === 'GRANTED' ? 50000 : 0,
        }),
      });
      const data = await res.json();
      setAdjudicationResult(data);
      // Immediately re-fetch live state so change reflects across all views
      await loadData();
    } catch (err) {
      console.error('Error during adjudication:', err);
    } finally {
      setAdjudicatingId(null);
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
    loadData();
  }, [loadData]);

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
              <p className="text-2xl font-black text-slate-900 mt-1">
                {pendingPetitions.length} {pendingPetitions.length === 1 ? 'Petition' : 'Petitions'}
              </p>
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
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {allPetitions.length > 0 ? `${Math.round((adjudicatedPetitions.length / allPetitions.length) * 100)}%` : '100%'}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Calculated via vw_judge_caseload_metrics</span>
            </div>
          </div>

          {/* Pending Bail Adjudications Action Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            {adjudicationResult && (
              <div className={`p-4 rounded-xl space-y-2 text-xs border ${
                adjudicationResult.decision === 'GRANTED'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 ${
                    adjudicationResult.decision === 'GRANTED' ? 'text-emerald-800' : 'text-red-800'
                  }`}>
                    {adjudicationResult.decision === 'GRANTED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    {adjudicationResult.procedureExecuted} Executed Successfully
                  </span>
                  <button onClick={() => setAdjudicationResult(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <p>
                  <strong>Outcome Pronounced:</strong>{' '}
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    adjudicationResult.decision === 'GRANTED' ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                  }`}>
                    {adjudicationResult.decision === 'GRANTED' ? '✓ BAIL GRANTED' : '✕ BAIL REJECTED'}
                  </span>
                  {adjudicationResult.suretyAmount > 0 && ` (Surety: ₹${adjudicationResult.suretyAmount.toLocaleString('en-IN')})`}
                </p>
                <p><strong>Database Trigger:</strong> <code className={`px-1 py-0.5 rounded font-mono ${adjudicationResult.decision === 'GRANTED' ? 'bg-emerald-100' : 'bg-red-100'}`}>{adjudicationResult.triggerExecuted}</code></p>
                <p className={`text-[11px] ${adjudicationResult.decision === 'GRANTED' ? 'text-emerald-700' : 'text-red-700'}`}>Storage Engine: <strong>{adjudicationResult.storageBackend}</strong></p>
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

            {pendingPetitions.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-lg font-bold">
                  ✓
                </div>
                <h3 className="text-sm font-bold text-slate-900">All Listed Bail Petitions Adjudicated</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  There are currently no pending bail petitions awaiting judicial ruling for this bench. All listed applications have been pronounced and synchronized with the case registry.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingPetitions.map((petition) => (
                  <div key={petition.bailId} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">{petition.caseNumber}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          petition.riskScore <= 25 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : petition.riskScore <= 45 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          Risk Index: {petition.riskScore.toFixed(1)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {petition.bailType}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mt-1">
                        {petition.caseTitle || petition.caseNumber}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {petition.grounds}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Applied by: {petition.appliedByAdvocate || 'Advocate'} • Custody: {petition.custodyDays} days • Docket #{petition.bailId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <NextLink
                        href={`/bail/intelligence?case=${encodeURIComponent(petition.caseNumber)}`}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
                      >
                        Precedents
                      </NextLink>
                      <button
                        disabled={adjudicatingId === petition.bailId}
                        onClick={() => handleAdjudicate(petition.bailId, 'GRANTED')}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow disabled:opacity-50"
                      >
                        {adjudicatingId === petition.bailId ? 'Executing SP...' : 'Grant Bail'}
                      </button>
                      <button
                        disabled={adjudicatingId === petition.bailId}
                        onClick={() => handleAdjudicate(petition.bailId, 'REJECTED')}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-500 transition shadow disabled:opacity-50"
                      >
                        {adjudicatingId === petition.bailId ? 'Executing SP...' : 'Reject Bail'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Pronounced Bench Decisions Card */}
          {adjudicatedPetitions.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Recently Pronounced Bench Decisions & Decrees
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Certified orders synchronized with the case registry via trigger <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">trg_sync_case_status</code>.
                  </p>
                </div>
                <NextLink href="/cases" className="text-xs text-blue-600 font-bold hover:underline">
                  View in Case Registry →
                </NextLink>
              </div>

              <div className="divide-y divide-slate-100">
                {adjudicatedPetitions.map((adj) => (
                  <div key={adj.bailId} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{adj.caseNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          adj.status === 'GRANTED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {adj.status === 'GRANTED' ? '✓ BAIL GRANTED' : '✕ BAIL REJECTED'}
                        </span>
                        {adj.suretyAmount && adj.suretyAmount > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            Surety: ₹{adj.suretyAmount.toLocaleString('en-IN')}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs font-medium text-slate-800">{adj.caseTitle || adj.applicantName}</p>
                      <p className="text-[11px] text-slate-500 italic">
                        &quot;{adj.reasoning}&quot;
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Pronounced by: <strong>{adj.adjudicatedByJudge || 'Hon. Judicial Bench'}</strong> on {adj.decisionDate || 'Today'}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      Order Certified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LAWYER / ADVOCATE DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {activeRole === 'LAWYER' && (
        <div className="space-y-6">
          {/* Ruling Alert Notification Banner */}
          {adjudicatedPetitions.length > 0 && (
            <div className={`p-4 rounded-xl flex items-start gap-3 text-xs border ${
              adjudicatedPetitions[0].status === 'GRANTED'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}>
              {adjudicatedPetitions[0].status === 'GRANTED' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className={`font-bold uppercase tracking-wider text-[11px] ${
                  adjudicatedPetitions[0].status === 'GRANTED' ? 'text-emerald-800' : 'text-red-800'
                }`}>
                  Judicial Ruling Certified & Synced
                </h4>
                <p className="mt-0.5">
                  Bail decision has been pronounced by the Bench for matter{' '}
                  <strong className="font-mono">{adjudicatedPetitions[0].caseNumber}</strong> ({adjudicatedPetitions[0].applicantName}):{' '}
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    adjudicatedPetitions[0].status === 'GRANTED' ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                  }`}>
                    {adjudicatedPetitions[0].status === 'GRANTED' ? '✓ BAIL GRANTED' : '✕ BAIL REJECTED'}
                  </span>
                  {adjudicatedPetitions[0].suretyAmount && adjudicatedPetitions[0].suretyAmount > 0 ? ` (Surety: ₹${adjudicatedPetitions[0].suretyAmount.toLocaleString('en-IN')})` : ''}.
                  Order certified and state synchronized across Case Registry and Bench.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Advocate Counsel Practice Console
                </h2>
                <p className="text-xs text-slate-500">
                  Active Legal Counsel: {currentUser?.name || 'Advocate Counsel'} (Bar Council of Karnataka)
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
                <p className="text-xl font-bold text-slate-900 mt-1">{cases.length} Registered Matters</p>
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

            {/* Active Client Bail Petitions & Docket Tracker */}
            <div className="pt-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">
                Client Bail Petitions & Docket Tracker
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-2.5 px-3">Docket ID</th>
                      <th className="py-2.5 px-3">CNR Number & Client</th>
                      <th className="py-2.5 px-3">Bail Category</th>
                      <th className="py-2.5 px-3">Risk Index</th>
                      <th className="py-2.5 px-3">Application Date</th>
                      <th className="py-2.5 px-3">Current Status</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {allPetitions.map((pet) => (
                      <tr key={pet.bailId} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">#{pet.bailId}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-mono font-bold text-blue-700">{pet.caseNumber}</p>
                          <p className="text-[11px] text-slate-600">{pet.applicantName}</p>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{pet.bailType}</td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            pet.riskScore <= 25 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {pet.riskScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{pet.appliedDate}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${
                            pet.status === 'GRANTED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : pet.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {pet.status === 'GRANTED' 
                              ? `✓ GRANTED (${pet.suretyAmount ? `₹${pet.suretyAmount.toLocaleString('en-IN')}` : 'Released'})`
                              : pet.status === 'REJECTED'
                              ? '✕ REJECTED'
                              : '⏳ UNDER BENCH REVIEW'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <NextLink
                            href={`/bail/intelligence?case=${encodeURIComponent(pet.caseNumber)}`}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded text-[11px] transition"
                          >
                            Assess Precedents →
                          </NextLink>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <p className="text-2xl font-black text-slate-900 mt-1">{cases.length} Cases</p>
              <span className="text-[11px] text-slate-500 font-medium">Assigned to Court Halls 1 & 2</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Pending Bail Petitions</span>
                <Scale className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-1">{pendingPetitions.length} Listed</p>
              <span className="text-[11px] text-amber-600 font-medium">Awaiting Judicial Ruling</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase">Adjudicated Rulings</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-1">{adjudicatedPetitions.length} Decrees</p>
              <span className="text-[11px] text-emerald-600 font-medium">Ready for Release Orders</span>
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
                <li>Verify surety bonds and issue formal release certificates for cases with status <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">BAIL_GRANTED</code>.</li>
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
              <span className="text-xs font-bold text-slate-500 uppercase">Registered Cases</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{cases.length}</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center">
              <Scale className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-500 uppercase">Bail Petitions</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{allPetitions.length}</p>
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
                    <td className="py-2.5 px-3 font-mono">5</td>
                    <td className="py-2.5 px-3 font-medium">Adv. Shriranjini Kumar</td>
                    <td className="py-2.5 px-3 text-slate-600">shriranjini.adv@barcouncil.org</td>
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
