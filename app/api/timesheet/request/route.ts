// app/api/timesheet/request/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { query } from "@/server/sql/sqlHandler.server";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  // 1) Ensure we have our secret
  if (!JWT_SECRET) {
    return NextResponse.json(
      { error: "Missing JWT_SECRET environment variable" },
      { status: 500 }
    );
  }

  // 2) Authenticate user via token cookie
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

  // 3) Parse and validate request body
  let body: { dates?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const dates = body.dates;
  if (!Array.isArray(dates) || dates.length === 0) {
    return NextResponse.json({ error: "No dates provided" }, { status: 400 });
  }

  // 4) Upsert each date into AnnualLeave with pending_approval
  try {
    for (const date of dates) {
      // 4a) If an entry exists, update its status
      await query(
        `
        UPDATE AnnualLeave
        SET approval_status = 'pending_approval'
        WHERE UserId = $1 AND Date = $2
        `,
        [userId, date]
      );

      // 4b) If no entry exists, insert a new one
      await query(
        `
        INSERT INTO AnnualLeave (UserId, Date, approval_status)
        SELECT $1, $2, 'pending_approval'
        WHERE NOT EXISTS (
          SELECT 1 FROM AnnualLeave WHERE UserId = $1 AND Date = $2
        )
        `,
        [userId, date]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error requesting leave:", err);
    return NextResponse.json(
      { error: "Failed to request leave" },
      { status: 500 }
    );
  }
}

