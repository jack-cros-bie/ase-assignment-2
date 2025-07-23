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
      approval_status: string;
    }>(
      `SELECT TO_CHAR("date", 'DD-MM-YYYY') AS date, "approval_status"
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

export async function POST(req: NextRequest) {
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

  // Parse body
  let dates: string[];
  try {
    const body = await req.json();
    dates = body.dates;
    if (!Array.isArray(dates) || dates.some(d => typeof d !== 'string')) {
      throw new Error();
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (dates.length === 0) {
    return NextResponse.json({ error: 'No dates provided' }, { status: 400 });
  }

  // Delete entries
  try {
    // Use PostgreSQL ANY(array) syntax to delete multiple dates at once
    const result = await query(
      `DELETE FROM "annualleave"
       WHERE "userid" = $1
         AND "date" = ANY($2::date[])`,
      [userId, dates]
    );

    return NextResponse.json({ success: true, deleted: (result as any).rowCount ?? dates.length });
  } catch (err) {
    console.error('Error deleting leave entries:', err);
    return NextResponse.json({ error: 'Failed to cancel leave' }, { status: 500 });
  }
}
