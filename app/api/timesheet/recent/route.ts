// app/api/timesheet/recent/route.ts
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

  // Get token from cookie
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let payload: { userid: number };
  try {
    payload = jwt.verify(token, JWT_SECRET) as { userid: number };
  } catch (err) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const userId = payload.userid;

  try {
    // Fetch 3 most recent unique bookingcodes used by the user
    const result = await query(
      `
      SELECT bookingcode
      FROM timesheets
      WHERE userid = $1
      GROUP BY bookingcode
      ORDER BY MAX(date) DESC
      LIMIT 3`,
      [userId]
    );

    const recentCodes = result.map((row) => row.bookingcode);

    return NextResponse.json({ recentCodes }, { status: 200 });
  } catch (err: any) {
    console.error("Failed to fetch recent bookingcodes:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
