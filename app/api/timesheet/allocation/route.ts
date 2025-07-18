import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/server/sql/sqlHandler.server";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req: NextRequest) {
  if (!JWT_SECRET) {
    return NextResponse.json(
      { error: "Missing JWT_SECRET environment variable" },
      { status: 500 }
    );
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let userId: number;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userid: number };
    userId = payload.userid;
  } catch (err) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  // Use query param "week" to determine the Monday
  const { searchParams } = req.nextUrl;
  const weekParam = searchParams.get("week");

  let monday: Date;
  try {
    const baseDate = weekParam ? new Date(weekParam) : new Date();
    const day = baseDate.getDay();
    const diffToMonday = (day + 6) % 7;
    monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
  } catch (err) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  try {
    const result: any[] = await query(
      `SELECT bookingcode, date, starttime, endtime, approved
      FROM timesheets
      WHERE userid = $1 AND date BETWEEN $2 AND $3`,
      [userId, monday.toISOString().slice(0, 10), sunday.toISOString().slice(0, 10)]
    );

    const allocation: Record<string, number> = {};
    let total = 0;

    for (const row of result) {
      const start = new Date(`1970-01-01T${row.starttime}`);
      const end = new Date(`1970-01-01T${row.endtime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (!isNaN(hours)) {
        allocation[row.bookingcode] = (allocation[row.bookingcode] || 0) + hours;
        total += hours;
      }
    }

    return NextResponse.json({ totalHours: total, breakdown: allocation, entries: result });
  } catch (err) {
    console.error("Allocation API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
