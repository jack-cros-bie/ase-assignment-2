// File: app/api/auth/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/server/sql/sqlHandler.server';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}

export async function GET(req: NextRequest) {
  // Retrieve token from cookies
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const userId = payload.userid;
  if (!userId) {
    return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
  }

  // Fetch user details
  try {
    const rows = await query<{ userid: number; username: string }>(
      `SELECT "userid" AS userid, "username" AS username
       FROM "account"
       WHERE "userid" = $1`,
      [userId]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = rows[0];
    return NextResponse.json(user);
  } catch (err) {
    console.error('Error fetching current user:', err);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

