import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log("Verify result:", id);
    return NextResponse.json({ 
      success: true, 
      data: { id, status: "Verified", verifiedAt: new Date().toISOString() } 
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
