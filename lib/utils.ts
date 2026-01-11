import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Validate a simple email format.
 * This uses a pragmatic regex (not full RFC) suitable for form validation.
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const s = String(email).trim().toLowerCase();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(s);
}

/**
 * Basic phone validation.
 * - For `country === 'TH'` accepts common Thai formats:
 *   - Local: `0XXXXXXXXX` (10 digits)
 *   - International: `66XXXXXXXXX` or `+66XXXXXXXXX` (11 digits without +)
 *   - or a 9-digit number (without leading 0)
 * - For other countries performs a simple digit-length check (8-15 digits).
 */
export function isValidPhone(
  phone: string | null | undefined,
  country = "TH"
): boolean {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, "");

  if (country === "TH") {
    if (digits.length === 10 && digits.startsWith("0")) return true;
    if (digits.length === 11 && digits.startsWith("66")) return true;
    if (digits.length === 9) return true;
    return false;
  }

  return digits.length >= 8 && digits.length <= 15;
}

/**
 * Normalize a phone number to E.164-like format when possible.
 * Returns `+66...` for Thai numbers or `+<digits>` for generic valid numbers.
 * Returns `null` when normalization isn't possible.
 */
export function normalizePhoneToE164(
  phone: string | null | undefined,
  country = "TH"
): string | null {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");

  if (country === "TH") {
    if (digits.length === 10 && digits.startsWith("0")) {
      return "+66" + digits.slice(1);
    }
    if (digits.length === 11 && digits.startsWith("66")) {
      return "+" + digits;
    }
    if (digits.length === 9) {
      return "+66" + digits;
    }
    return null;
  }

  if (digits.length >= 8 && digits.length <= 15) return "+" + digits;
  return null;
}
