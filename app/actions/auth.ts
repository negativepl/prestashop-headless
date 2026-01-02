"use server";

import { headers } from "next/headers";
import { binshops } from "@/lib/binshops/client";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import {
  checkRateLimit,
  resetRateLimit,
  getLoginKey,
  getRegistrationKey,
} from "@/lib/auth/rate-limiter";

// Helper to get client IP from headers
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  // Rate limiting - max 5 registrations per IP per 15 minutes
  const ip = await getClientIP();
  const rateLimitKey = getRegistrationKey(ip);
  const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

  if (!rateLimit.success) {
    return {
      success: false,
      error: `Zbyt wiele prób rejestracji. Spróbuj ponownie za ${Math.ceil(rateLimit.resetIn / 60)} minut.`,
    };
  }

  // Validation
  if (!email || !password || !firstName || !lastName) {
    return { success: false, error: "Wszystkie pola są wymagane" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Hasła nie są identyczne" };
  }

  if (password.length < 8) {
    return { success: false, error: "Hasło musi mieć minimum 8 znaków" };
  }

  // Stronger password validation
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return { success: false, error: "Hasło musi zawierać wielkie litery, małe litery i cyfry" };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Nieprawidłowy format email" };
  }

  // Name validation - prevent XSS
  const nameRegex = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-']+$/;
  if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
    return { success: false, error: "Imię i nazwisko mogą zawierać tylko litery" };
  }

  // Use Binshops API for registration
  const result = await binshops.register({
    email,
    password,
    firstName,
    lastName,
  });

  if (result.success && result.customerId) {
    // Create secure JWT session
    await createSession({
      customerId: result.customerId,
      email,
      firstName,
      lastName,
    });
  }

  return result;
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email i hasło są wymagane" };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Nieprawidłowy format email" };
  }

  // Rate limiting - max 5 attempts per email+IP per 15 minutes
  const ip = await getClientIP();
  const rateLimitKey = getLoginKey(email, ip);
  const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

  if (!rateLimit.success) {
    return {
      success: false,
      error: `Zbyt wiele prób logowania. Spróbuj ponownie za ${Math.ceil(rateLimit.resetIn / 60)} minut.`,
    };
  }

  // Use Binshops API for login (includes password verification!)
  const result = await binshops.login(email, password);

  if (!result.success || !result.customer) {
    return { success: false, error: result.error || "Nieprawidłowy email lub hasło" };
  }

  // Reset rate limit on successful login
  resetRateLimit(rateLimitKey);

  const customer = result.customer;

  // Create secure JWT session
  await createSession({
    customerId: customer.id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
  });

  return {
    success: true,
    customer: {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    },
  };
}

export async function logoutUser() {
  await deleteSession();
  return { success: true };
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return {
    id: String(session.customerId),
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
  };
}
