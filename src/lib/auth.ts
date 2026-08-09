import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "neet2027-study-tracker-secret-key";

export function signToken(payload: { userId: number; username: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { userId: number; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
  } catch {
    return null;
  }
}

export function getUserFromRequest(request: Request): { userId: number; username: string } | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}
