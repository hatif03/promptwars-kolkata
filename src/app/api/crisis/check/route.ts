import { NextRequest, NextResponse } from "next/server";
import { checkCrisisContent } from "@/lib/safety/crisis";
import {
  crisisCheckRequestSchema,
  formatZodError,
} from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = crisisCheckRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: formatZodError(parsed.error) },
      { status: 400 }
    );
  }

  const result = checkCrisisContent(parsed.data.text);
  return NextResponse.json(result);
}
