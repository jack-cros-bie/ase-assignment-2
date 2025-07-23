// File: app/api/manager-approvals/ApproveTimesheet/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/server/sql/sqlHandler.server';

export async function POST(request: Request) {
  try {
    // 1) Properly parse the URL & its query string
    const url = new URL(request.url);
    const timesheetentryid = url.searchParams.get('leaveentryid');

    // 2) Missing parameter
    if (!timesheetentryid) {
      return NextResponse.json(
        { error: 'timesheetentryid parameter is required' },
        { status: 400 }
      );
    }

    // 3) Not a number?
    const parsed = parseInt(timesheetentryid, 10);
    if (isNaN(parsed)) {
      return NextResponse.json(
        { error: 'Invalid timesheetentryid.  Must be a number.' },
        { status: 400 }
      );
    }

    // 4) Perform the update
    const TimesheetRecord = await query<{}>(
      `UPDATE timesheets
       SET approved = 'approved'
       WHERE timesheetentryid = $1`,
      [parsed]
    );

    console.log(TimesheetRecord);

    return NextResponse.json(TimesheetRecord);
  } catch (error) {
    console.error('Error setting timesheet approval:', error);
    return NextResponse.json(
      { error: 'Failed to approve timesheet' },
      { status: 500 }
    );
  }
}

