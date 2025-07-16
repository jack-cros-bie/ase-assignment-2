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

  // Parse month (YYYY-MM) query param
  const monthParam = req.nextUrl.searchParams.get('month');
  if (!monthParam) {
    return NextResponse.json({ error: 'Missing month parameter' }, { status: 400 });
  }

  // Query entries for the month
  try {
    const rows = await query<{
      date: string;
      starttime: string;
      endtime: string;
      approval_status: string;
    }>(
      `SELECT "date" AS date, "approval_status"
       FROM "annualleave"
       WHERE "userid" = $1
         AND "date" >= $2::date
         AND "date" < (date_trunc('month', $2::date) + INTERVAL '1 month')
       ORDER BY "date"`,
      [userId, `${monthParam}-01`]
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Error loading timesheet:', err);
    return NextResponse.json({ error: 'Failed to load timesheet' }, { status: 500 });
  }
}

