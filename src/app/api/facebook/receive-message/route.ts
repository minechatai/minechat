
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received Facebook message:", body);
  } catch (error) {
    console.error("Error processing Facebook message:", error);
  }
  return NextResponse.json({ success: true });
}
