import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, email, password, name } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email.toLowerCase())));

    if (existing.length > 0) {
      const takenField = existing[0].username === username ? "Username" : "Email";
      return NextResponse.json({ error: `${takenField} already taken` }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({
        username,
        email: email.toLowerCase(),
        password: hashed,
        name: name || username,
      })
      .returning();

    const token = signToken({ userId: user.id, username: user.username });
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
