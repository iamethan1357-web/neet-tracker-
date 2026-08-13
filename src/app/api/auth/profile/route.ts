import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, auth.userId));
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    className: user.className,
    targetScore: user.targetScore,
    weakSubjects: user.weakSubjects,
  });
}

export async function PUT(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // If email is being updated, validate it
  if (body.email !== undefined) {
    const emailLower = body.email?.toLowerCase()?.trim();

    if (emailLower) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailLower)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }

      // Check if email is already taken by another user
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, emailLower));

      if (existing.length > 0 && existing[0].id !== auth.userId) {
        return NextResponse.json({ error: "This email is already used by another account" }, { status: 409 });
      }

      body.email = emailLower;
    }
  }

  const [updated] = await db
    .update(users)
    .set({
      name: body.name,
      email: body.email,
      className: body.className,
      targetScore: body.targetScore,
      weakSubjects: body.weakSubjects,
    })
    .where(eq(users.id, auth.userId))
    .returning();

  return NextResponse.json({
    id: updated.id,
    username: updated.username,
    email: updated.email,
    name: updated.name,
    className: updated.className,
    targetScore: updated.targetScore,
    weakSubjects: updated.weakSubjects,
  });
}
