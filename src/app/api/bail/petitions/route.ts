import { NextRequest, NextResponse } from 'next/server';
import { getAllBailPetitions, getPendingBailPetitions, getAdjudicatedBailPetitions, getCases } from '@/lib/case-store';
import { verifyAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth-token';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifyAuthToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
    }

    const all = getAllBailPetitions();
    const pending = getPendingBailPetitions();
    const adjudicated = getAdjudicatedBailPetitions();
    const cases = getCases();

    return NextResponse.json({
      all,
      pending,
      adjudicated,
      counts: {
        total: all.length,
        pending: pending.length,
        adjudicated: adjudicated.length,
        casesCount: cases.length,
      },
    });
  } catch (error) {
    console.error('Error fetching bail petitions:', error);
    return NextResponse.json({ error: 'Failed to fetch petitions' }, { status: 500 });
  }
}
