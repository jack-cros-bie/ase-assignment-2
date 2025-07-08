// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query } from "@/server/sql/sqlHandler.server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    await query(
      `INSERT INTO Account (Username, Password, PasswordExpiryDate)
       VALUES ($1, $2, CURRENT_DATE + INTERVAL '90 days')`,
      [username, hashed]
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error creating user:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

