'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CasesPage() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const cases = [
    {
      id: 1,
      caseNumber: 'CNR-KA-BLR-2026-00101',
      title: 'State of Karnataka v. Vikram Malhotra',
      court: 'City Civil and Sessions Court Bengaluru',
      accused: 'Vikram Malhotra',
      filingDate: '2026-09-15',
      priority: 'URGENT',
      status: 'BAIL_PENDING',
      charges: 'IPC Sec 420, IT Act Sec 66D',
    },
    {
      id: 2,
      caseNumber: 'CNR-KA-BLR-2026-00204',
      title: 'Rahul Verma v. Priya Deshmukh',
      court: 'City Civil and Sessions Court Bengaluru',
      accused: 'Priya Deshmukh',
      filingDate: '2026-10-02',
      priority: 'STANDARD',
      status: 'HEARING_IN_PROGRESS',
      charges: 'IPC Sec 406 (Breach of Trust)',
    },
    {
      id: 3,
      caseNumber: 'CNR-KA-BLR-2026-00318',
      title: 'State v. Mahesh Patil',
      court: 'Chief Metropolitan Magistrate Court Bengaluru',
      accused: 'Mahesh Patil',
      filingDate: '2026-10-18',
      priority: 'LOW',
      status: 'FILED',
      charges: 'IPC Sec 323 (Affray / Simple Hurt)',
    },
  ];

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Case Registry & Dossiers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Populated from the relational schema: <code className="bg-slate-200 px-1 py-0.5 rounded">cases</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">courts</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">case_parties</code>, <code className="bg-slate-200 px-1 py-0.5 rounded">charges</code>.
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
            <option value="HEARING_IN_PROGRESS">Hearing in Progress</option>
            <option value="FILED">Filed</option>
            <option value="BAIL_GRANTED">Bail Granted</option>
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
              {filteredCases.map((c) => (
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
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : c.status === 'HEARING_IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href="/bail/intelligence"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 rounded font-bold border border-slate-300 transition"
                    >
                      Assess Bail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
