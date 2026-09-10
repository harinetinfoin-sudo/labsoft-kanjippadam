import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // TODO: Add inventory logic later
    console.log("Inventory POST:", body);
    return NextResponse.json({ success: true, data: { id: Date.now().toString(), ...body } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
