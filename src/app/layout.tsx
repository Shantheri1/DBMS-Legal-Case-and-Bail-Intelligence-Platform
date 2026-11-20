import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'JurisPredict - Legal Case & Bail Intelligence Platform',
  description: 'DBMS Level 3 Experiential Learning Project | PES University',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col">
        {/* Dynamic RBAC Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-slate-300">Department of Computer Science & Engineering | PES University</p>
              <p>Course: DBMS Experiential Learning </p>
            </div>
            <div className="text-right">
              <p className="text-amber-400 font-medium">Team: Shantheni Shenoy (PES1UG24CS428) & Shriranjini (PES1UG24CS447)</p>
              <p>Section: H | Multi-Paradigm: PostgreSQL + pgvector + MongoDB</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
