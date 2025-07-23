// File: app/api/manager-approvals/RejectAnnualLeave/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/server/sql/sqlHandler.server';

export async function POST(request: Request) {
  try {
    // 1) Properly parse the URL & querystring
    const url = new URL(request.url);
    const leaveentryid = url.searchParams.get('leaveentryid');

    // 2) Missing?
    if (!leaveentryid) {
      return NextResponse.json(
        { error: 'leaveentryid parameter is required' },
        { status: 400 }
      );
    }

    // 3) Not a number?
    const parsedLeaveEntryId = parseInt(leaveentryid, 10);
    if (isNaN(parsedLeaveEntryId)) {
      return NextResponse.json(
        { error: 'Invalid leaveentryid.  Must be a number.' },
        { status: 400 }
      );
    }

    // 4) Perform the update
    const AnnualLeaveRecord = await query<{}>(
      `UPDATE annualleave
       SET approval_status = 'rejected'
       WHERE leaveentryid = $1`,
      [parsedLeaveEntryId]
    );

    console.log(AnnualLeaveRecord);

    return NextResponse.json(AnnualLeaveRecord);
  } catch (error) {
    console.error('Error setting leave rejection:', error);
    return NextResponse.json(
      { error: 'Failed to reject leave' },
      { status: 500 }
    );
  }
}

