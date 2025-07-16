// File: app/api/manager-approvals/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/server/sql/sqlHandler.server';

export async function GET() {
  try {
    const AnnualLeaveRecord = await query<{
      "userid": number;
      "date": string;
      "description": string;
    }>(
      `SELECT annualleave.userid, annualleave.date, annualleave.description
       FROM annualleave 
       INNER JOIN employeedetails ON annualleave.userid=employeedetails.userid 
       WHERE employeedetails.managerid = 2`
    );
    return NextResponse.json(AnnualLeaveRecord);
  } catch (error) {
    console.error('Error fetching key employees:', error);
    return NextResponse.json({ error: 'Failed to load key employees' }, { status: 500 });
  }
}


// SELECT annualleave.userid, annualleave.date, annualleave.description, employeedetails.managerid 
// FROM annualleave 
// INNER JOIN employeedetails ON annualleave.userid=employeedetails.userid 
// WHERE employeedetails.managerid = 2;