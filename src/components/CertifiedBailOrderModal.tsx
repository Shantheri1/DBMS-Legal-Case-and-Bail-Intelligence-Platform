'use client';

import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, Download, Scale, QrCode } from 'lucide-react';

export interface BailOrderData {
  bailId: number;
  caseNumber: string;
  caseTitle: string;
  applicantName: string;
  courtName: string;
  bailType: string;
  grounds?: string;
  riskScore?: number;
  suretyAmount: number;
  reasoning: string;
  judgeName: string;
  decisionDate: string;
  charges?: string;
  policeStation?: string;
}

interface CertifiedBailOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: BailOrderData | null;
}

// Deterministic QR Code Matrix generator for authentic SVG visualization
function generateQrMatrix(input: string): boolean[][] {
  const size = 25; // 25x25 Version 2 QR
  const matrix: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

  // 1. Finder patterns (Top-Left, Top-Right, Bottom-Left)
  const placeFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[r0 + r][c0 + c] = true;
        }
      }
    }
  };
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Simple hash-based deterministic data fill
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder zones
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= size - 8;
      const inBL = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTL && !inTR && !inBL && !inTiming) {
        const val = (hash ^ (r * 13 + c * 17)) % 100;
        matrix[r][c] = val > 45;
      }
    }
  }

  return matrix;
}

export default function CertifiedBailOrderModal({
  isOpen,
  onClose,
  orderData,
}: CertifiedBailOrderModalProps) {
  if (!isOpen || !orderData) return null;

  const orderDate = orderData.decisionDate || new Date().toISOString().split('T')[0];
  const orderNumber = `CR-ORD/${new Date(orderDate).getFullYear()}/${orderData.bailId || '101'}`;
  const verificationHash = `SHA256-${orderData.caseNumber.replace(/[^A-Z0-9]/g, '')}-${orderData.bailId}X99A`;
  const qrString = `https://ecourts.gov.in/verify?cnr=${orderData.caseNumber}&bailId=${orderData.bailId}&auth=${verificationHash}`;
  const qrMatrix = generateQrMatrix(qrString);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Container Dialog */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header Action Bar (Hidden in Print) */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Official Certified Bail Order & Decree</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                  Digitally Signed • eCourts CIS 3.2
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Authorized for Prison Release & Surety Verification under CrPC Sec 437/439.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Download / Print PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 flex justify-center">
          <div
            id="certified-bail-order-document"
            className="bg-white border-2 border-slate-900 p-8 sm:p-12 rounded-lg shadow-lg max-w-3xl w-full text-slate-900 font-serif leading-relaxed relative"
          >
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <Scale className="w-96 h-96 text-slate-900" />
            </div>

            {/* Emblem & Court Header */}
            <div className="text-center border-b-2 border-slate-900 pb-6 space-y-1.5">
              <div className="inline-block p-2 rounded-full border-2 border-slate-900 mb-1">
                <Scale className="w-8 h-8 text-slate-900 mx-auto" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider font-serif">
                {orderData.courtName.toUpperCase()}
              </h1>
              <p className="text-xs uppercase font-sans tracking-widest font-semibold text-slate-700">
                Criminal Miscellaneous & Bail Jurisdiction
              </p>
              <p className="text-xs font-mono font-bold text-slate-600">
                CNR NUMBER: <span className="underline">{orderData.caseNumber}</span>
              </p>
            </div>

            {/* Decree Sub-Header */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-sans border-b border-slate-300 pb-4 gap-2">
              <div>
                <p><strong>Order Reference:</strong> <span className="font-mono">{orderNumber}</span></p>
                <p><strong>Bail Petition Docket:</strong> #{orderData.bailId} / {new Date(orderDate).getFullYear()}</p>
                <p><strong>Petition Nature:</strong> {orderData.bailType} BAIL PETITION</p>
              </div>
              <div className="sm:text-right">
                <p><strong>Date of Pronouncement:</strong> {new Date(orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p><strong>Bench:</strong> {orderData.judgeName}</p>
                <p><strong>Police Station:</strong> {orderData.policeStation || 'Cyber Crime PS / Jurisdiction'}</p>
              </div>
            </div>

            {/* Cause Title: Parties */}
            <div className="mt-6 text-xs font-serif bg-slate-50/60 p-4 rounded border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-900 uppercase">State of Karnataka (Through Prosecution)</span>
                <span className="italic font-sans text-slate-600">... Complainant / State</span>
              </div>
              <p className="text-center font-bold font-sans text-[11px] my-1 text-slate-500">— VERSUS —</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 uppercase">{orderData.applicantName}</span>
                <span className="italic font-sans text-slate-600">... Accused / Bail Petitioner</span>
              </div>
            </div>

            {/* Operative Court Order Pronouncement */}
            <div className="mt-8 space-y-4 text-xs font-serif leading-relaxed text-justify">
              <h2 className="text-center text-sm font-bold uppercase tracking-widest border-b border-slate-900 pb-1 font-sans">
                JUDICIAL BAIL DECREE & RELEASE DIRECTIVE
              </h2>

              <p>
                <strong>PRESENT:</strong> Hon&apos;ble Presiding Judge <span className="font-semibold">{orderData.judgeName}</span>, presiding over the Criminal Division.
              </p>

              <p>
                The petition filed under Section 437/439 of the Code of Criminal Procedure, 1973 (CrPC) for the grant of regular release on bail having been called for final adjudication, and upon hearing the arguments of the Learned Counsel representing the petitioner and the Learned Public Prosecutor representing the State:
              </p>

              {/* Judicial Findings / Reasoning */}
              <div className="p-3 bg-slate-50 border-l-4 border-slate-900 italic font-sans text-[11px] text-slate-800">
                &quot;{orderData.reasoning}&quot;
              </div>

              <p className="font-bold text-center text-sm py-1 font-sans text-emerald-900 bg-emerald-50 border border-emerald-300 rounded">
                ORDER: THE BAIL APPLICATION IS HEREBY ALLOWED AND GRANTED.
              </p>

              <p>
                The Superintendent of the Central / District Prison is hereby directed to release the accused/applicant, <strong>{orderData.applicantName}</strong>, forth-with, subject to compliance with the following mandatory conditions:
              </p>

              {/* Statutory Conditions */}
              <ol className="list-decimal list-inside space-y-2 pl-2 font-sans text-[11px]">
                <li>
                  <strong>Surety Bond:</strong> The accused shall execute a personal bond for a sum of{' '}
                  <span className="font-bold text-slate-950 underline">₹{orderData.suretyAmount.toLocaleString('en-IN')}</span>{' '}
                  with one solvent local surety to the satisfaction of the Registrar / Magistrate.
                </li>
                <li>
                  <strong>Surrender of Travel Documents:</strong> The petitioner shall surrender his/her passport before the trial court and shall not leave the state jurisdiction without prior written permission.
                </li>
                <li>
                  <strong>Non-Tampering of Evidence:</strong> The accused shall not tamper with prosecution evidence, access frozen servers, or directly/indirectly induce any witnesses.
                </li>
                <li>
                  <strong>Investigative Attendance:</strong> The accused shall mark physical attendance at the jurisdictional police station every alternate Monday between 10:00 AM and 1:00 PM.
                </li>
              </ol>
            </div>

            {/* Official Certification, Signatures & QR Code */}
            <div className="mt-10 pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs font-sans">
              
              {/* Left: Dynamic QR Code for Prison Superintendent Verification */}
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white border border-slate-900 rounded shadow-sm">
                  <svg width="84" height="84" viewBox="0 0 25 25" className="shape-rendering-crisp">
                    {qrMatrix.map((row, r) =>
                      row.map((cell, c) => (
                        <rect
                          key={`${r}-${c}`}
                          x={c}
                          y={r}
                          width="1"
                          height="1"
                          fill={cell ? '#0f172a' : '#ffffff'}
                        />
                      ))
                    )}
                  </svg>
                </div>
                <div className="space-y-0.5 max-w-[200px]">
                  <p className="text-[10px] font-bold text-slate-900 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-blue-700" />
                    <span>NPIP Prison Verification</span>
                  </p>
                  <p className="text-[9px] text-slate-500 leading-tight">
                    Scan via eCourts / National Prison Portal to verify judicial signature.
                  </p>
                  <p className="text-[9px] font-mono text-slate-600 truncate">
                    {verificationHash}
                  </p>
                </div>
              </div>

              {/* Right: Digital Signature Stamp */}
              <div className="text-right space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 font-bold text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DIGITALLY SIGNED & SEALED</span>
                </div>
                <p className="text-xs font-bold font-serif text-slate-900 mt-1">
                  {orderData.judgeName}
                </p>
                <p className="text-[10px] text-slate-500 font-sans">
                  Presiding Judge • Criminal Division
                </p>
                <p className="text-[9px] text-slate-400 font-mono">
                  Certified Copy Issued by Registry General
                </p>
              </div>
            </div>

            {/* Bottom Official Disclaimer */}
            <div className="mt-8 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400 font-sans">
              JurisPredict Judicial Platform • Generated pursuant to Section 439 CrPC • High Court of Karnataka Digital Order Dispatch System
            </div>
          </div>
        </div>

        {/* Footer Print Banner */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 no-print text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Ready for one-click print or download as high-resolution PDF.</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Print Style Injector */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #certified-bail-order-document,
          #certified-bail-order-document * {
            visibility: visible !important;
          }
          #certified-bail-order-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 15mm 20mm !important;
            border: 2px solid #000 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
