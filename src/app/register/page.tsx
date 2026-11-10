'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Scale, Briefcase, FileText, Lock, Mail, User, Phone, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'LAWYER' as 'JUDGE' | 'LAWYER' | 'CLERK',
    phone: '',
    designation: 'Additional Sessions Judge',
    barCouncilNo: '',
    courtId: '1',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name || formData.name.trim().length < 3) {
      setErrorMessage('Please enter your full legal name (minimum 3 characters).');
      return;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid official email address.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMessage(data?.error || 'Registration failed. Please check your information.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        `Account registered successfully as ${formData.role}! Redirecting to your assigned workspace...`
      );

      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error: Unable to contact registration service.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 text-center border-b border-slate-800">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Register Judicial Officer / Counsel
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Institutional Role Onboarding • JurisPredict
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* Role Selection Tabs */}
            <div>
              <label className="block font-bold text-slate-800 mb-2">
                Select Your Judicial / Legal Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'JUDGE' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    formData.role === 'JUDGE'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Scale className="w-5 h-5 text-amber-600" />
                  <span className="text-[11px]">Judge / Bench</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'LAWYER' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    formData.role === 'LAWYER'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span className="text-[11px]">Advocate / Lawyer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'CLERK' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    formData.role === 'CLERK'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span className="text-[11px]">Court Clerk / Desk</span>
                </button>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder={
                      formData.role === 'JUDGE'
                        ? 'Hon. Justice Ananya Sen'
                        : formData.role === 'LAWYER'
                        ? 'Adv. Rahul Deshmukh'
                        : 'Suresh Kumar'
                    }
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Mobile Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder={
                    formData.role === 'JUDGE'
                      ? 'judge.sen@karnatakacourts.gov.in'
                      : formData.role === 'LAWYER'
                      ? 'advocate.deshmukh@barcouncil.org'
                      : 'clerk.blr@karnatakacourts.gov.in'
                  }
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {formData.role === 'JUDGE' && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-amber-900 mb-1">Assigned Court Division</label>
                    <select
                      value={formData.courtId}
                      onChange={(e) => setFormData({ ...formData, courtId: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white"
                    >
                      <option value="1">City Civil and Sessions Court Bengaluru</option>
                      <option value="2">Chief Metropolitan Magistrate Court Bengaluru</option>
                      <option value="3">High Court of Karnataka (Principal Bench)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-amber-900 mb-1">Judicial Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'LAWYER' && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <label className="block font-semibold text-blue-900 mb-1">
                  Bar Council Enrollment Number (BCI Record)
                </label>
                <input
                  type="text"
                  placeholder="e.g. KAR/2048/2021"
                  value={formData.barCouncilNo}
                  onChange={(e) => setFormData({ ...formData, barCouncilNo: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white uppercase font-mono"
                />
              </div>
            )}

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <span>Registering Account in Database...</span>
              ) : (
                <>
                  <span>Complete Registration & Enter Workspace</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          {/* Return to Sign In */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs">
            <span className="text-slate-500">Already registered in the judicial system? </span>
            <Link href="/login" className="text-amber-600 hover:text-amber-700 font-bold underline">
              Sign In Here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
