import { NextResponse } from "next/server";
import { db } from "@/db";
import { dailyLogs } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (date) {
    const [log] = await db
      .select()
      .from(dailyLogs)
      .where(and(eq(dailyLogs.userId, auth.userId), eq(dailyLogs.date, date)));
    return NextResponse.json(log || null);
  }

  if (from && to) {
    const logs = await db
      .select()
      .from(dailyLogs)
      .where(
        and(
          eq(dailyLogs.userId, auth.userId),
          gte(dailyLogs.date, from),
          lte(dailyLogs.date, to)
        )
      )
      .orderBy(desc(dailyLogs.date));
    return NextResponse.json(logs);
  }

  const logs = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, auth.userId))
    .orderBy(desc(dailyLogs.date))
    .limit(365);
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const date = body.date || new Date().toISOString().split("T")[0];

  const existing = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, auth.userId), eq(dailyLogs.date, date)));

  if (existing.length > 0) {
    const subjects = [body.physicsStudy, body.chemistryStudy, body.botanyStudy, body.zoologyStudy];
    const doneCount = subjects.filter(Boolean).length;
    const isCompleted = doneCount >= 3 && (body.questionsPracticed || 0) > 0;

    const [updated] = await db
      .update(dailyLogs)
      .set({
        ...body,
        completed: isCompleted,
      })
      .where(and(eq(dailyLogs.userId, auth.userId), eq(dailyLogs.date, date)))
      .returning();
    return NextResponse.json(updated);
  }

  const subjects = [body.physicsStudy, body.chemistryStudy, body.botanyStudy, body.zoologyStudy];
  const doneCount = subjects.filter(Boolean).length;
  const isCompleted = doneCount >= 3 && (body.questionsPracticed || 0) > 0;

  const [log] = await db
    .insert(dailyLogs)
    .values({
      userId: auth.userId,
      date,
      ...body,
      completed: isCompleted,
    })
    .returning();
  return NextResponse.json(log);
}
