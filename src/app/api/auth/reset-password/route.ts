import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    // Find valid token
    const [resetEntry] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      );

    if (!resetEntry) {
      return NextResponse.json({ error: "Invalid or expired reset link. Please request a new one." }, { status: 400 });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db
      .update(users)
      .set({ password: hashed })
      .where(eq(users.id, resetEntry.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetEntry.id));

    return NextResponse.json({ message: "Password reset successfully! You can now sign in." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET to verify token validity
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, error: "No token provided" });
    }

    const [resetEntry] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      );

    if (!resetEntry) {
      return NextResponse.json({ valid: false, error: "Invalid or expired reset link" });
    }

    // Get user email (masked) for display
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, resetEntry.userId));

    const maskedEmail = user?.email
      ? user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
      : "unknown";

    return NextResponse.json({ valid: true, email: maskedEmail });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ valid: false, error: "Server error" });
  }
}
