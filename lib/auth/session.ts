import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { authLogger, logError } from "@/lib/logger";

const SECRET_KEY = process.env.AUTH_SECRET;

if (!SECRET_KEY) {
  throw new Error(
    "AUTH_SECRET environment variable is required. Generate one with: openssl rand -base64 32"
  );
}

if (SECRET_KEY.length < 32) {
  throw new Error("AUTH_SECRET must be at least 32 characters long");
}

const key = new TextEncoder().encode(SECRET_KEY);

export interface SessionPayload {
  customerId: number;
  email: string;
  firstName: string;
  lastName: string;
  expiresAt: Date;
}

export async function createSession(payload: Omit<SessionPayload, "expiresAt">): Promise<string> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const token = await new SignJWT({ ...payload, expiresAt: expiresAt.toISOString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    // Check if session is expired
    const expiresAt = new Date(payload.expiresAt as string);
    if (expiresAt < new Date()) {
      await deleteSession();
      return null;
    }

    return {
      customerId: payload.customerId as number,
      email: payload.email as string,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      expiresAt,
    };
  } catch (error) {
    logError(authLogger, "Session verification failed", error);
    await deleteSession();
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function verifySession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session;
}
