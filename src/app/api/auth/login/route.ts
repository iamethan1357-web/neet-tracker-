import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json({ error: "Email/username and password required" }, { status: 400 });
    }

    const loginLower = login.toLowerCase().trim();

    // Find user by email OR username
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, loginLower), eq(users.username, loginLower)));

    if (!user) {
      return NextResponse.json({ error: "No account found with this email or username" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = signToken({ userId: user.id, username: user.username });
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        className: user.className,
        targetScore: user.targetScore,
        weakSubjects: user.weakSubjects,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
