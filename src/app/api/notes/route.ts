import { NextResponse } from "next/server";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const subject = url.searchParams.get("subject");

  const allNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, auth.userId))
    .orderBy(desc(notes.updatedAt));

  const filtered = subject ? allNotes.filter((n) => n.subject === subject) : allNotes;
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const [note] = await db
    .insert(notes)
    .values({
      userId: auth.userId,
      subject: body.subject,
      title: body.title,
      content: body.content,
    })
    .returning();
  return NextResponse.json(note);
}

export async function PUT(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const [note] = await db
    .update(notes)
    .set({
      title: body.title,
      content: body.content,
      subject: body.subject,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, body.id), eq(notes.userId, auth.userId)))
    .returning();
  return NextResponse.json(note);
}

export async function DELETE(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, auth.userId)));
  return NextResponse.json({ success: true });
}
