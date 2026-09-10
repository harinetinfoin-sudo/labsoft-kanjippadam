import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log("Amend result:", id, body);
    return NextResponse.json({ 
      success: true, 
      data: { id, amended: true, ...body } 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
