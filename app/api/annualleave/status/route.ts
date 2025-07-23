import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/server/sql/sqlHandler.server';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  // Authenticate user
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
  const userId = payload.userid;

  // Parse date (YYYY-MM-DD) query param
  const dateParam = req.nextUrl.searchParams.get('date');
  if (!dateParam) {
    return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
  }

  // Query status for the specific date
  try {
    const rows = await query<{ approval_status: string }>(
      `SELECT approval_status
       FROM annualleave
       WHERE userid = $1
         AND date = $2::date`,
      [userId, dateParam]
    );

    if (rows.length === 0) {
      // No entry for this date: return unknown status
      return NextResponse.json({ date: dateParam, approval_status: 'unknown' });
    }

    const { approval_status } = rows[0];
    return NextResponse.json({ date: dateParam, approval_status });
  } catch (err) {
    console.error('Error loading leave status:', err);
    return NextResponse.json({ error: 'Failed to load leave status' }, { status: 500 });
  }
}
