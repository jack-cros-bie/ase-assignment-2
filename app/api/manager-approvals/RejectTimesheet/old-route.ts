// File: /api/manager-approvals/SetAnnualLeaveApproval/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/server/sql/sqlHandler.server';

export async function POST(request: Request) {
    try {
    // Extract the managerId from the query parameters.
    const urlParams = new URLSearchParams(request.url);
    const timesheetentryid = urlParams.get('leaveentryid');

    if (!timesheetentryid) {
      return NextResponse.json({ error: 'timesheetentryid parameter is required' }, { status: 400 });
    }

    const parsedTimesheetEntryId = parseInt(timesheetentryid, 10);

    if (isNaN(parsedTimesheetEntryId)) {
      return NextResponse.json({ error: 'Invalid timesheetentryid.  Must be a number.' }, { status: 400 });
    }

    const TimesheetRecord = await query<{}>(
      `UPDATE timesheets
       SET approved = 'rejected'
       WHERE timesheetentryid = $1`,
       // Use parameterized query
      [parsedTimesheetEntryId] // Pass the timesheetentryid as a parameter
    );

    console.log(TimesheetRecord)

    return NextResponse.json(TimesheetRecord);
  } catch (error) {
    console.error('Error setting timesheet approval:', error);
    return NextResponse.json({ error: 'Failed to approve timesheet'}, { status: 500 });
  }
}
