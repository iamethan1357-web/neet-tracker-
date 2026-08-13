import { NextResponse } from "next/server";
import { db } from "@/db";
import { revisionTopics } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";

const SPACED_INTERVALS = [1, 3, 7, 15, 30];

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const topics = await db
    .select()
    .from(revisionTopics)
    .where(eq(revisionTopics.userId, auth.userId))
    .orderBy(desc(revisionTopics.createdAt));
  return NextResponse.json(topics);
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);

  const [topic] = await db
    .insert(revisionTopics)
    .values({
      userId: auth.userId,
      subject: body.subject,
      topic: body.topic,
      status: "not_done",
      nextReviewDate: nextDate.toISOString().split("T")[0],
      reviewCount: 0,
    })
    .returning();
  return NextResponse.json(topic);
}

export async function PUT(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.action === "review") {
    const [existing] = await db
      .select()
      .from(revisionTopics)
      .where(and(eq(revisionTopics.id, body.id), eq(revisionTopics.userId, auth.userId)));

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newCount = (existing.reviewCount || 0) + 1;
    const intervalIndex = Math.min(newCount, SPACED_INTERVALS.length - 1);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + SPACED_INTERVALS[intervalIndex]);

    const newStatus = newCount >= 4 ? "strong" : "revised";

    const [updated] = await db
      .update(revisionTopics)
      .set({
        reviewCount: newCount,
        nextReviewDate: nextDate.toISOString().split("T")[0],
        status: newStatus,
      })
      .where(and(eq(revisionTopics.id, body.id), eq(revisionTopics.userId, auth.userId)))
      .returning();
    return NextResponse.json(updated);
  }

  const [updated] = await db
    .update(revisionTopics)
    .set({ status: body.status })
    .where(and(eq(revisionTopics.id, body.id), eq(revisionTopics.userId, auth.userId)))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  await db.delete(revisionTopics).where(and(eq(revisionTopics.id, id), eq(revisionTopics.userId, auth.userId)));
  return NextResponse.json({ success: true });
}
