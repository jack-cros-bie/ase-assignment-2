// File: app/api/employees/information/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/server/sql/sqlHandler.server';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawId = searchParams.get('userid');

  // 1) Validate presence
  if (!rawId) {
    return NextResponse.json(
      { error: 'Missing userid query parameter' },
      { status: 400 }
    );
  }

  // 2) Validate format
  const userid = Number(rawId);
  if (isNaN(userid) || userid <= 0) {
    return NextResponse.json(
      { error: 'Invalid userid query parameter' },
      { status: 400 }
    );
  }

  try {
    // 3) Fetch all columns for this user
    const results = await query<Record<string, any>>(
      `SELECT * FROM "employeedetails" WHERE "userid" = $1`,
      [userid]
    );

    if (results.length === 0) {
      return NextResponse.json(
        { error: `No employee found for userid ${userid}` },
        { status: 404 }
      );
    }

    // 4) Return the record
    return NextResponse.json(results[0]);
  } catch (err: any) {
    console.error('Error fetching employee details:', err);
    return NextResponse.json(
      { error: 'Failed to load employee details' },
      { status: 500 }
    );
  }
}

