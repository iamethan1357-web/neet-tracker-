import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  let query = db.select().from(tasks).where(eq(tasks.userId, auth.userId)).orderBy(desc(tasks.pinned), desc(tasks.createdAt));

  const result = await query;
  const filtered = type ? result.filter((t) => t.type === type) : result;
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const [task] = await db
    .insert(tasks)
    .values({
      userId: auth.userId,
      title: body.title,
      description: body.description,
      type: body.type || "daily",
      priority: body.priority || "medium",
      pinned: body.pinned || false,
      dueDate: body.dueDate,
    })
    .returning();
  return NextResponse.json(task);
}

export async function PUT(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const [task] = await db
    .update(tasks)
    .set({
      title: body.title,
      description: body.description,
      type: body.type,
      priority: body.priority,
      pinned: body.pinned,
      completed: body.completed,
      dueDate: body.dueDate,
    })
    .where(and(eq(tasks.id, body.id), eq(tasks.userId, auth.userId)))
    .returning();
  return NextResponse.json(task);
}

export async function DELETE(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, auth.userId)));
  return NextResponse.json({ success: true });
}
