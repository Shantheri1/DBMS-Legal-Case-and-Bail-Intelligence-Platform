'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function CasesPage() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [dataSource, setDataSource] = useState<string>('loading');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        const res = await fetch('/api/cases');
        if (res.ok) {
          const data = await res.json();
          setCases(data.cases || []);
          setDataSource(data.source || 'postgresql_live');
        }
      } catch (err) {
        console.error('Failed to load cases:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.accused.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Case Registry & Dossiers</h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              dataSource === 'postgresql_live' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-blue-50 text-blue-700 border-blue-300'
            }`}>
              {dataSource === 'postgresql_live' ? '● PostgreSQL Live Engine' : '● Relational Schema Active'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Dynamically queried from normalized relational tables: <code className="bg-slate-200 px-1 py-0.5 rounded">cases</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">courts</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">case_parties</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">charges</code>.
          </p>
        </div>
        <Link
          href="/bail/apply"
          className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-400 transition shadow"
        >
          + File New Bail Petition
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search CNR, Title, Accused..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="font-semibold text-slate-600">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="BAIL_PENDING">Bail Pending</option>
            <option value="BAIL_GRANTED">Bail Granted</option>
            <option value="BAIL_REJECTED">Bail Rejected</option>
            <option value="HEARING_IN_PROGRESS">Hearing in Progress</option>
            <option value="FILED">Filed</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">CNR Number</th>
                <th className="py-3 px-4">Case Title & Court</th>
                <th className="py-3 px-4">Primary Accused</th>
                <th className="py-3 px-4">Invoked Charges</th>
                <th className="py-3 px-4">Filing Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching case dossiers from relational backend...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No cases match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {c.caseNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{c.title}</p>
                      <p className="text-[11px] text-slate-500">{c.court}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {c.accused}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.charges}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {c.filingDate}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          c.status === 'BAIL_PENDING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : c.status === 'HEARING_IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : c.status === 'BAIL_GRANTED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : c.status === 'BAIL_REJECTED'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {c.status === 'BAIL_GRANTED' ? '✓ BAIL GRANTED' : c.status === 'BAIL_REJECTED' ? '✕ BAIL REJECTED' : c.status.replace(/_/g, ' ')}
                      </span>
                      {c.lastAdjudication && c.lastAdjudication.suretyAmount > 0 && (
                        <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          Surety: ₹{c.lastAdjudication.suretyAmount.toLocaleString('en-IN')}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/bail/intelligence?case=${encodeURIComponent(c.caseNumber)}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 rounded font-bold border border-slate-300 transition"
                      >
                        Assess Bail →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
