'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FileBailPage() {
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Case (CNR Number)</label>
            <select
              value={formData.caseNumber}
              onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 font-mono"
            >
              <option value="CNR-KA-BLR-2026-00101">CNR-KA-BLR-2026-00101 (State v. Vikram Malhotra)</option>
              <option value="CNR-KA-BLR-2026-00204">CNR-KA-BLR-2026-00204 (Rahul Verma v. Priya Deshmukh)</option>
              <option value="CNR-KA-BLR-2026-00318">CNR-KA-BLR-2026-00318 (State v. Mahesh Patil)</option>
            </select>
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
    </div>
  );
}
