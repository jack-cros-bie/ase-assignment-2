// app/api/timesheet/submit/route.ts
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
    const { entries } = await req.json();
    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json({ error: "No entries provided" }, { status: 400 });
    }

    try{
    // 4) Insert each valid entry
    for (const entry of entries) {
      const { code, date, start, end } = entry;

      if (!code || !date || !start || !end) continue;

      await query(
        `INSERT INTO humanresources.timesheets (bookingcode, date, starttime, endtime)
         VALUES ($1, $2, $3, $4)`,
        [code, date, start, end]
      );
    }

    return NextResponse.json(
      { message: "Timesheets submitted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

