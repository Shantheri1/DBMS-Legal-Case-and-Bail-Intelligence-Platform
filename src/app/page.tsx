import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span>⚖️ Level 3 DBMS Experiential Learning</span>
            <span>•</span>
            <span>Section H</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Legal Case & Bail <span className="text-amber-400">Intelligence Platform</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            A multi-paradigm database system combining <strong>PostgreSQL Relational Core</strong> for ACID case lifecycle tracking with <strong>pgvector Semantic Precedents</strong> to predict bail outcomes, assess flight risk, and cite landmark Supreme Court rulings.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              href="/bail/intelligence"
              className="px-6 py-3 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition shadow-lg flex items-center gap-2"
            >
              <span>Launch AI Bail Engine</span>
              <span>→</span>
            </Link>
            <Link
              href="/cases"
              className="px-6 py-3 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition border border-slate-700"
            >
              Explore Case Registry
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition border border-slate-700"
            >
              Role Dashboards
            </Link>
          </div>
        </div>

        {/* Decorative Badge */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 bg-slate-800/60 backdrop-blur-md p-6 rounded-xl border border-slate-700 w-80 text-xs space-y-3">
          <h4 className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">System Architecture</h4>
          <div className="flex justify-between py-1 border-b border-slate-700/60">
            <span className="text-slate-400">Relational SQL:</span>
            <span className="font-mono text-emerald-400 font-semibold">PostgreSQL (15 Tables)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/60">
            <span className="text-slate-400">Vector Engine:</span>
            <span className="font-mono text-cyan-400 font-semibold">pgvector (HNSW Cosine)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/60">
            <span className="text-slate-400">NoSQL Store:</span>
            <span className="font-mono text-amber-300 font-semibold">MongoDB (FIR Transcripts)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Web Interface:</span>
            <span className="font-mono text-purple-300 font-semibold">Next.js App Router</span>
          </div>
        </div>
      </div>

      {/* Advanced DBMS Features Grid */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
          Advanced Database Features Implemented
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mb-4">
              TX
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">ACID Transactions</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Atomic case registration bundling party association, charge framing, and preliminary hearing under <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">SAVEPOINT</code> safeguards.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
              TG
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">Integrity Triggers</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Prevents judicial hearing double-booking within 45 minutes; auto-syncs case status upon bail adjudication and calculates risk scores.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg mb-4">
              SP
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">Stored Procedures</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">fn_calculate_bail_risk_score</code> weighting bailable vs non-bailable offences and repeat offender records.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg mb-4">
              VC
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">pgvector Precedents</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sub-millisecond cosine distance search over landmark Supreme Court bail jurisprudence (Antil, Arnesh Kumar, Sanjay Chandra).
            </p>
          </div>
        </div>
      </div>

      {/* Team Details & Viva Card */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Project Team Contribution & Responsibilities</h4>
            <p className="text-xs text-slate-600">PES University | CSE Department | Experiential Learning Level 3</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-300">
              <span className="font-bold text-slate-900 block">Shantheni Shenoy (PES1UG24CS428)</span>
              <span className="text-slate-500">Relational DDL, ER Design, Triggers, Views & Next.js UI Forms</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-300">
              <span className="font-bold text-slate-900 block">Shriranjini (PES1UG24CS447)</span>
              <span className="text-slate-500">pgvector Embedding Engine, Stored Procedures, API Routes & Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
