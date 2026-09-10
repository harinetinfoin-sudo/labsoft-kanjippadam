import { NextResponse } from "next/server";
import { getRolesForApi } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: getRolesForApi(),
  });
}
