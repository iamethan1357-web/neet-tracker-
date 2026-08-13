import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, auth.userId));
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    username: user.username,
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
  const [updated] = await db
    .update(users)
    .set({
      name: body.name,
      className: body.className,
      targetScore: body.targetScore,
      weakSubjects: body.weakSubjects,
    })
    .where(eq(users.id, auth.userId))
    .returning();

  return NextResponse.json({
    id: updated.id,
    username: updated.username,
    name: updated.name,
    className: updated.className,
    targetScore: updated.targetScore,
    weakSubjects: updated.weakSubjects,
  });
}
