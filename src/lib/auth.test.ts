import { describe, expect, it, vi } from "vitest";
import { getJwtSecret, hasPermission, validateCredentials, issueToken, listUsers } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

describe("authentication and authorization", () => {
  it("accepts valid credentials for the default admin user", async () => {
    const user = await validateCredentials("admin@labsoft.local", "Admin@123");

    expect(user).not.toBeNull();
    expect(user?.email).toBe("admin@labsoft.local");
  });

  it("rejects invalid credentials", async () => {
    const user = await validateCredentials("admin@labsoft.local", "WrongPass@123");

    expect(user).toBeNull();
  });

  it("grants the super admin all permissions", () => {
    expect(hasPermission("Super Admin", "users:write")).toBe(true);
    expect(hasPermission("Super Admin", "billing:write")).toBe(true);
  });

  it("denies a receptionist access to admin-only permissions", () => {
    expect(hasPermission("Receptionist", "users:write")).toBe(false);
  });

  it("issues a JWT token for a valid user", async () => {
    const user = await validateCredentials("pathologist@labsoft.local", "Doctor@123");

    expect(user).not.toBeNull();
    expect(() => issueToken(user!)).not.toThrow();
  });

  it("returns a user list for the configured role model", async () => {
    const users = await listUsers();

    expect(users.length).toBeGreaterThan(0);
    expect(users.some((user) => user.email === "admin@labsoft.local")).toBe(true);
  });

  it("requires a production JWT secret instead of silently using a dev fallback", () => {
    const originalSecret = process.env.JWT_SECRET;

    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("JWT_SECRET", "");

    expect(() => getJwtSecret()).toThrow(/JWT_SECRET/i);

    vi.unstubAllEnvs();
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it("rate-limits repeated login attempts for a single key", () => {
    const key = "login:auth-test@example.com";

    const first = checkRateLimit(key, 3, 60_000);
    const second = checkRateLimit(key, 3, 60_000);
    const third = checkRateLimit(key, 3, 60_000);
    const fourth = checkRateLimit(key, 3, 60_000);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(true);
    expect(fourth.allowed).toBe(false);
  });
});
