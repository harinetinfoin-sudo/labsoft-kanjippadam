import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    data: [
      { id: "admin", name: "Admin" },
      { id: "doctor", name: "Doctor" },
      { id: "technician", name: "Technician" },
    ] 
  });
}
