export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Invalid protocol");
    }
    return parsed.href;
  } catch {
    throw new Error("Invalid URL");
  }
}

export function sanitizeText(text: string, maxLength: number = 1000): string {
  if (!text || typeof text !== "string") return "";

  let sanitized = text.trim().slice(0, maxLength);

  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return sanitized;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password is too long" };
  }
  return { valid: true };
}

export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
}

export function sanitizeTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) return [];

  return tags
    .filter((tag) => typeof tag === "string")
    .map((tag) => sanitizeText(tag, 50).toLowerCase())
    .filter((tag) => tag.length > 0 && tag.length <= 50)
    .slice(0, 20);
}

export function generateSecureToken(length: number = 64): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length];
  }
  return token;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);
