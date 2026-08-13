import { NextResponse } from "next/server";
import { db } from "@/db";
import { mockTests } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tests = await db
    .select()
    .from(mockTests)
    .where(eq(mockTests.userId, auth.userId))
    .orderBy(desc(mockTests.date));
  return NextResponse.json(tests);
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const [test] = await db
    .insert(mockTests)
    .values({
      userId: auth.userId,
      date: body.date,
      score: body.score,
      totalMarks: body.totalMarks || 720,
      physicsScore: body.physicsScore || 0,
      chemistryScore: body.chemistryScore || 0,
      botanyScore: body.botanyScore || 0,
      zoologyScore: body.zoologyScore || 0,
      mistakes: body.mistakes,
    })
    .returning();
  return NextResponse.json(test);
}

export async function DELETE(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id"));
  await db.delete(mockTests).where(and(eq(mockTests.id, id), eq(mockTests.userId, auth.userId)));
  return NextResponse.json({ success: true });
}
