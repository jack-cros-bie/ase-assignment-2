// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "@/server/sql/sqlHandler.server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  // 1) Fetch user record by username
  const rows = await query<{ userid: number; password: string }>(
    `SELECT userid, password FROM Account WHERE username = $1`,
    [username]
  );

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const { userid, password: hash } = rows[0];

  // 2) Compare supplied password to stored hash
  const isValid = await bcrypt.compare(password, hash);
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  // 3) (Optional) Issue a JWT or set a cookie
  const token = jwt.sign({ userid }, JWT_SECRET, { expiresIn: "1h" });

  // Set it as an HTTP-only cookie
  const res = NextResponse.json({ success: true, userid });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600,
    path: "/",
  });

  return res;
}

