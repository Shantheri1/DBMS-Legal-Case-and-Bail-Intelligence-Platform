import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuthToken, AUTH_COOKIE_NAME, normalizeRole } from '@/lib/auth-token';

export const dynamic = 'force-dynamic';

export interface CaseRecord {
  id: number;
  caseNumber: string;
  title: string;
  court: string;
  accused: string;
  filingDate: string;
  priority: string;
  status: string;
  charges: string;
}

// Fallback seed cases when database is offline
const FALLBACK_CASES: CaseRecord[] = [
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

export async function GET(request: NextRequest) {
  try {
    // 1. RBAC authentication check
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    const session = await verifyAuthToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Session invalid' }, { status: 401 });
    }

    // 2. Query PostgreSQL live database
    try {
      const res = await query<CaseRecord>(`
        SELECT 
            c.case_id as id,
            c.case_number as "caseNumber",
            c.title,
            crt.court_name as court,
            COALESCE(p.name, 'Undisclosed') as accused,
            TO_CHAR(c.filing_date, 'YYYY-MM-DD') as "filingDate",
            COALESCE(c.priority_level, 'STANDARD') as priority,
            c.status,
            COALESCE(STRING_AGG(DISTINCT ls.act_name || ' Sec ' || ls.section_number, ', '), 'IPC Sec 420') as charges
        FROM cases c
        JOIN courts crt ON c.court_id = crt.court_id
        LEFT JOIN case_parties cp ON c.case_id = cp.case_id AND cp.party_role = 'ACCUSED'
        LEFT JOIN persons p ON cp.person_id = p.person_id
        LEFT JOIN charges ch ON c.case_id = ch.case_id
        LEFT JOIN charge_law_sections cls ON ch.charge_id = cls.charge_id
        LEFT JOIN law_sections ls ON cls.section_id = ls.section_id
        GROUP BY c.case_id, c.case_number, c.title, crt.court_name, p.name, c.filing_date, c.priority_level, c.status
        ORDER BY c.case_id ASC
      `);

      if (res.rows && res.rows.length > 0) {
        return NextResponse.json({ cases: res.rows, source: 'postgresql_live' });
      }
    } catch (dbErr) {
      console.warn('PostgreSQL query fallback for /api/cases:', dbErr instanceof Error ? dbErr.message : dbErr);
    }

    // Return fallback seed cases if database is not reachable
    return NextResponse.json({ cases: FALLBACK_CASES, source: 'seed_fallback' });
  } catch (error) {
    console.error('Error in /api/cases:', error);
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}
