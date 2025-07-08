// File: app/api/employees/key/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/server/sql/sqlHandler.server';

export async function GET() {
  try {
    const employees = await query<{
      "userid": number;
      "firstname": string;
      "surname": string;
      "jobtitle": string;
    }>(
      `SELECT "userid", "firstname", "surname", "jobtitle"
       FROM "employeedetails"
       ORDER BY "companystartdate" DESC
       LIMIT 5`
    );
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching key employees:', error);
    return NextResponse.json({ error: 'Failed to load key employees' }, { status: 500 });
  }
}

