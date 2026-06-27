import { NextRequest, NextResponse } from "next/server";
import { checkCrisisContent } from "@/lib/safety/crisis";

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text required" }, { status: 400 });
  }

  const result = checkCrisisContent(text);
  return NextResponse.json(result);
}
