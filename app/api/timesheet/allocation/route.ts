// File: app/api/timesheet/allocation/route.ts

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/server/sql/sqlHandler.server";

export async function GET(req: NextRequest) {
  // 1) Read SECRET at runtime
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return NextResponse.json(
      { error: "Missing JWT_SECRET environment variable" },
      { status: 500 }
    );
  }

  // 2) Check cookie
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // 3) Verify token
  let userId: number;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userid: number };
    userId = payload.userid;
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // 4) Parse & validate "week" query
  const { searchParams } = req.nextUrl;
  const weekParam = searchParams.get("week");
  let baseDate: Date;

  if (weekParam) {
    const ms = Date.parse(weekParam);
    if (isNaN(ms)) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }
    baseDate = new Date(ms);
  } else {
    baseDate = new Date();
  }

  // 5) Compute Monday → Sunday
  const day = baseDate.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // 6) Query and aggregate
  try {
    const rows: Array<{
      bookingcode: string;
      date: string;
      starttime: string;
      endtime: string;
      approved: boolean;
    }> = await query(
      `SELECT bookingcode, date, starttime, endtime, approved
       FROM timesheets
       WHERE userid = $1
         AND date BETWEEN $2 AND $3`,
      [
        userId,
        monday.toISOString().slice(0, 10),
        sunday.toISOString().slice(0, 10),
      ]
    );

    let total = 0;
    const breakdown: Record<string, number> = {};

    for (const row of rows) {
      const start = new Date(`1970-01-01T${row.starttime}`);
      const end   = new Date(`1970-01-01T${row.endtime}`);
      const hours = (end.getTime() - start.getTime()) / 3_600_000;
      if (!isNaN(hours)) {
        breakdown[row.bookingcode] = (breakdown[row.bookingcode] || 0) + hours;
        total += hours;
      }
    }

    return NextResponse.json({
      totalHours: total,
      breakdown,
      entries: rows,
    });
  } catch (err: any) {
    console.error("Allocation API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

