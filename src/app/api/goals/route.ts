import { NextResponse } from "next/server";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, auth.userId))
    .orderBy(desc(goals.createdAt));
  return NextResponse.json(allGoals);
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const [goal] = await db
    .insert(goals)
    .values({
      userId: auth.userId,
      title: body.title,
      type: body.type || "daily",
      targetValue: body.targetValue,
      currentValue: body.currentValue || 0,
      dueDate: body.dueDate,
    })
    .returning();
  return NextResponse.json(goal);
}

export async function PUT(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const [goal] = await db
    .update(goals)
    .set({
      title: body.title,
      type: body.type,
      targetValue: body.targetValue,
      currentValue: body.currentValue,
      completed: body.completed,
      dueDate: body.dueDate,
    })
    .where(and(eq(goals.id, body.id), eq(goals.userId, auth.userId)))
    .returning();
  return NextResponse.json(goal);
}

export async function DELETE(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, auth.userId)));
  return NextResponse.json({ success: true });
}
