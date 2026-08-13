import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password, name } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.username, username));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({
      username,
      password: hashed,
      name: name || username,
    }).returning();

    const token = signToken({ userId: user.id, username: user.username });
    return NextResponse.json({ token, user: { id: user.id, username: user.username, name: user.name } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
