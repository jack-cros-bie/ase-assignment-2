// File: /api/manager-approvals/SetAnnualLeaveApproval/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/server/sql/sqlHandler.server';

export async function POST(request: Request) {
    try {
    // Extract the managerId from the query parameters.
    const urlParams = new URLSearchParams(request.url);
    const leaveentryid = urlParams.get('leaveentryid');

    if (!leaveentryid) {
      return NextResponse.json({ error: 'leaveentryid parameter is required' }, { status: 400 });
    }

    const parsedLeaveEntryId = parseInt(leaveentryid, 10);

    if (isNaN(parsedLeaveEntryId)) {
      return NextResponse.json({ error: 'Invalid leaveentryid.  Must be a number.' }, { status: 400 });
    }

    const AnnualLeaveRecord = await query<{}>(
      `UPDATE annualleave
       SET approval_status = 'rejected'
       WHERE leaveentryid = $1`,
       // Use parameterized query
      [parsedLeaveEntryId] // Pass the leaveentryid as a parameter
    );

    console.log(AnnualLeaveRecord)

    return NextResponse.json(AnnualLeaveRecord);
  } catch (error) {
    console.error('Error setting leave rejection:', error);
    return NextResponse.json({ error: 'Failed to reject leave' }, { status: 500 });
  }
}
