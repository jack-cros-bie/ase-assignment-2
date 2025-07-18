// // File: /api/manager-approvals/GetAnnualLeaveRequests/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/server/sql/sqlHandler.server';

export async function GET(request: Request) {
    try {
    // Extract the managerId from the query parameters.
    const urlParams = new URLSearchParams(request.url);
    const managerId = urlParams.get('managerId');

    if (!managerId) {
      return NextResponse.json({ error: 'managerId parameter is required' }, { status: 400 });
    }

    const parsedManagerId = parseInt(managerId, 10);

    if (isNaN(parsedManagerId)) {
      return NextResponse.json({ error: 'Invalid managerId.  Must be a number.' }, { status: 400 });
    }

    const AnnualLeaveRecord = await query<{}>(
      `SELECT annualleave.leaveentryid, annualleave.userid, employeedetails.firstname, employeedetails.surname, annualleave.date, annualleave.description
       FROM annualleave
       INNER JOIN employeedetails ON annualleave.userid=employeedetails.userid
       WHERE annualleave.approval_status='pending_approval' AND employeedetails.managerid = $1` , // Use parameterized query
      [parsedManagerId] // Pass the managerId as a parameter
    );

    console.log(AnnualLeaveRecord)

    return NextResponse.json(AnnualLeaveRecord);
  } catch (error) {
    console.error('Error fetching key employees:', error);
    return NextResponse.json({ error: 'Failed to load key employees' }, { status: 500 });
  }
}