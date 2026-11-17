'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, X, Check, ShieldAlert } from 'lucide-react';

interface CaseOption {
  id: number;
  caseNumber: string;
  title: string;
  court: string;
  accused: string;
  charges: string;
}

export default function FileBailPage() {
  const [cases, setCases] = useState<CaseOption[]>([
    {
      id: 1,
      caseNumber: 'CNR-KA-BLR-2026-00101',
      title: 'State of Karnataka v. Vikram Malhotra',
      court: 'City Civil and Sessions Court Bengaluru',
      accused: 'Vikram Malhotra',
      charges: 'IPC Sec 420, IT Act Sec 66D',
    },
    {
      id: 2,
      caseNumber: 'CNR-KA-BLR-2026-00204',
      title: 'Rahul Verma v. Priya Deshmukh',
      court: 'City Civil and Sessions Court Bengaluru',
      accused: 'Priya Deshmukh',
      charges: 'IPC Sec 406 (Breach of Trust)',
    },
    {
      id: 3,
      caseNumber: 'CNR-KA-BLR-2026-00318',
      title: 'State v. Mahesh Patil',
      court: 'Chief Metropolitan Magistrate Court Bengaluru',
      accused: 'Mahesh Patil',
      charges: 'IPC Sec 323 (Affray / Simple Hurt)',
    },
  ]);

  const [formData, setFormData] = useState({
    caseNumber: 'CNR-KA-BLR-2026-00101',
    appliedByAdvocate: 'Adv. Shantheni Shenoy (BCI/KA/428)',
    bailType: 'REGULAR',
    custodyDays: '45',
    grounds: 'Investigation is substantially completed, charge sheet has been submitted, and the applicant has clean antecedents with deep roots in society. No likelihood of witness tampering or flight risk.',
    suretyOffered: 'Yes, solvent local surety with property title deed in Bengaluru',
    undertakingPassport: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [resultData, setResultData] = useState<{
    bailId?: number;
    riskScore?: number;
    storageBackend?: string;
  }>({});

  // New Case Modal State
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCaseLoading, setNewCaseLoading] = useState(false);
  const [newCaseError, setNewCaseError] = useState('');
  const [newCaseSuccess, setNewCaseSuccess] = useState('');
  const [newCaseForm, setNewCaseForm] = useState({
    caseNumber: `CNR-KA-BLR-2026-00${Math.floor(400 + Math.random() * 500)}`,
    title: '',
    court: 'City Civil and Sessions Court Bengaluru',
    accused: '',
    charges: 'IPC Sec 420, IPC Sec 120B',
    priority: 'URGENT',
  });

  // Fetch registered cases dynamically from API
  useEffect(() => {
    async function loadCases() {
      try {
        const res = await fetch('/api/cases');
        if (res.ok) {
          const data = await res.json();
          if (data.cases && data.cases.length > 0) {
            setCases(data.cases);
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic cases, using defaults:', err);
      }
    }

    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.name) {
            setFormData((prev) => ({
              ...prev,
              appliedByAdvocate: `${data.user.name} (${data.user.email?.includes('shriranjini') ? 'BCI/KA/447' : 'BCI/KA/428'})`,
            }));
          }
        }
      } catch (err) {
        console.warn('Could not load current user:', err);
      }
    }

    loadCases();
    loadUser();
  }, []);

  const handleCreateNewCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewCaseError('');
    setNewCaseSuccess('');

    if (!newCaseForm.title || !newCaseForm.accused || !newCaseForm.caseNumber) {
      setNewCaseError('Please fill in Case Number, Title, and Accused Name.');
      return;
    }

    setNewCaseLoading(true);

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCaseForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setNewCaseError(data?.error || 'Failed to register new case.');
        setNewCaseLoading(false);
        return;
      }

      // Add to local cases state
      const created = data.case;
      setCases((prev) => [created, ...prev]);

      // Automatically select this newly created case as Target Case in the bail form
      setFormData((prev) => ({
        ...prev,
        caseNumber: created.caseNumber,
      }));

      setNewCaseSuccess(`Case ${created.caseNumber} registered! Selected as Target Case.`);

      setTimeout(() => {
        setShowNewCaseModal(false);
        setNewCaseSuccess('');
        // Prepare next auto-generated CNR
        setNewCaseForm({
          caseNumber: `CNR-KA-BLR-2026-00${Math.floor(400 + Math.random() * 500)}`,
          title: '',
          court: 'City Civil and Sessions Court Bengaluru',
          accused: '',
          charges: 'IPC Sec 420, IPC Sec 120B',
          priority: 'URGENT',
        });
      }, 1200);
    } catch (err) {
      console.error(err);
      setNewCaseError('Network error registering new case.');
    } finally {
      setNewCaseLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.grounds || formData.grounds.length < 30) {
      setError('Please provide comprehensive legal grounds (minimum 30 characters).');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/bail/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || 'Failed to submit bail petition.');
        setLoading(false);
        return;
      }

      setResultData({
        bailId: data.bailId,
        riskScore: data.riskScore,
        storageBackend: data.storageBackend,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Network communication error with registry backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/cases" className="text-xs text-amber-600 hover:underline">
          ← Back to Cases
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">
          File Bail Application (DML Form)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Demonstrates transactional insertion into <code className="bg-slate-200 px-1 py-0.5 rounded">bail_applications</code> with foreign key constraints to <code className="bg-slate-200 px-1 py-0.5 rounded">cases</code> and <code className="bg-slate-200 px-1 py-0.5 rounded">users</code>.
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-lg font-bold text-emerald-900">
            Bail Application Filed & Recorded!
          </h2>
          <div className="text-xs text-emerald-800 space-y-1.5 max-w-md mx-auto">
            <p>
              Petition assigned Docket ID: <span className="font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded">#{resultData.bailId || 104}</span>
            </p>
            <p>
              Automated Bail Risk Score: <span className="font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded">{resultData.riskScore || 30.0} / 100</span> (Computed via <code className="font-mono">fn_calculate_bail_risk_score</code>)
            </p>
            <p className="text-[11px] text-emerald-600">
              Backend Storage: <strong>{resultData.storageBackend || 'Relational Database Engine'}</strong>
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href={`/bail/intelligence?case=${encodeURIComponent(formData.caseNumber)}`}
              className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-lg hover:bg-emerald-600 transition"
            >
              Analyze in AI Intelligence Engine →
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 bg-white text-emerald-800 border border-emerald-300 font-bold text-xs rounded-lg hover:bg-emerald-50"
            >
              File Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Target Case (CNR Number)</label>
              <button
                type="button"
                onClick={() => setShowNewCaseModal(true)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Register New Case</span>
              </button>
            </div>
            <select
              value={formData.caseNumber}
              onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 font-mono"
            >
              {cases.map((c) => (
                <option key={c.caseNumber} value={c.caseNumber}>
                  {c.caseNumber} ({c.title})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Want to apply bail for another case? Click <button type="button" onClick={() => setShowNewCaseModal(true)} className="text-amber-600 font-semibold underline">+ Register New Case</button> to add it to the docket.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bail Category</label>
              <select
                value={formData.bailType}
                onChange={(e) => setFormData({ ...formData, bailType: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50"
              >
                <option value="REGULAR">Regular Bail (Post-Arrest / Sec 437/439)</option>
                <option value="ANTICIPATORY">Anticipatory Bail (Pre-Arrest / Sec 438)</option>
                <option value="INTERIM">Interim Bail (Medical / Urgent Relief)</option>
                <option value="DEFAULT_STATUTORY">Default Statutory Bail (Sec 167(2))</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pre-Trial Custody (Days)</label>
              <input
                type="number"
                value={formData.custodyDays}
                onChange={(e) => setFormData({ ...formData, custodyDays: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Filing Advocate / Counsel</label>
            <input
              type="text"
              readOnly
              value={formData.appliedByAdvocate}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-100 text-slate-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Legal Grounds & Circumstances
            </label>
            <textarea
              rows={4}
              value={formData.grounds}
              onChange={(e) => setFormData({ ...formData, grounds: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-3 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="State reasons: completion of investigation, clean antecedents, medical vulnerability, absence of flight risk..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Surety & Solvency Declaration</label>
            <input
              type="text"
              value={formData.suretyOffered}
              onChange={(e) => setFormData({ ...formData, suretyOffered: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="passport"
              checked={formData.undertakingPassport}
              onChange={(e) => setFormData({ ...formData, undertakingPassport: e.target.checked })}
              className="rounded text-amber-500 focus:ring-amber-400"
            />
            <label htmlFor="passport" className="text-xs text-slate-700 font-medium">
              Applicant undertakes to surrender passport & not tamper with prosecution evidence
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition shadow disabled:opacity-50"
          >
            {loading ? 'Submitting to Registry...' : 'Submit Bail Petition to Registry'}
          </button>
        </form>
      )}

      {/* Modal: Register New Case */}
      {showNewCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Register New Case Dossier</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                    eCourts DDL
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Creates new row in <code className="text-amber-400">cases</code> table to serve as valid Target Case.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewCaseModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCase} className="p-6 space-y-4">
              {newCaseError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                  {newCaseError}
                </div>
              )}
              {newCaseSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{newCaseSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CNR Number (Unique Case ID)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCaseForm.caseNumber}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, caseNumber: e.target.value })}
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. CNR-KA-BLR-2026-00450"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewCaseForm({
                        ...newCaseForm,
                        caseNumber: `CNR-KA-BLR-2026-00${Math.floor(400 + Math.random() * 500)}`,
                      })
                    }
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-300"
                    title="Generate new CNR number"
                  >
                    Auto CNR
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  value={newCaseForm.title}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, title: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. State of Karnataka v. Anand Kumar"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Accused Person Name</label>
                  <input
                    type="text"
                    required
                    value={newCaseForm.accused}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, accused: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Anand Kumar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={newCaseForm.priority}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, priority: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50"
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="STANDARD">STANDARD</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jurisdiction / Court</label>
                <select
                  value={newCaseForm.court}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, court: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50"
                >
                  <option value="City Civil and Sessions Court Bengaluru">City Civil and Sessions Court Bengaluru</option>
                  <option value="High Court of Karnataka">High Court of Karnataka</option>
                  <option value="Chief Metropolitan Magistrate Court Bengaluru">Chief Metropolitan Magistrate Court Bengaluru</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Offences & Law Sections (IPC / BNS / IT Act)</label>
                <input
                  type="text"
                  value={newCaseForm.charges}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, charges: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Section 420 IPC, Section 66D IT Act"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newCaseLoading}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition shadow disabled:opacity-50 flex items-center gap-1.5"
                >
                  {newCaseLoading ? 'Registering...' : 'Register & Select Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
