import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ success: true, data: [] }); }
export async function POST(req: Request) { const b = await req.json(); return NextResponse.json({ success: true, data: b }); }
