import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const validRoles = new Set(["STUDENT", "INSTRUCTOR", "ADMIN"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = String(body.role ?? "STUDENT");

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Please fill in all fields" } },
      { status: 400 },
    );
  }

  if (!validRoles.has(role)) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid role" } },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, error: { code: "USER_EXISTS", message: "User already exists" } },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: `${firstName} ${lastName}`,
      password: await bcrypt.hash(password, 10),
      role: role as "STUDENT" | "INSTRUCTOR" | "ADMIN",
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}