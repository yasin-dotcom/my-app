import { NextRequest, NextResponse } from "next/server";
import { getAllSettings, setSetting, maskApiKey } from "@/lib/settings";

const VALID_KEYS = ["apify_api_key", "openai_api_key", "anthropic_api_key"];

export async function GET() {
  try {
    const settings = getAllSettings();
    const masked: Record<string, string> = {};
    for (const key of VALID_KEYS) {
      masked[key] = settings[key] ? maskApiKey(settings[key]) : "";
    }
    return NextResponse.json(masked);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || !VALID_KEYS.includes(key)) {
      return NextResponse.json(
        { error: `Invalid key. Valid keys: ${VALID_KEYS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!value || typeof value !== "string" || value.trim().length === 0) {
      return NextResponse.json(
        { error: "Value is required" },
        { status: 400 }
      );
    }

    setSetting(key, value.trim());
    return NextResponse.json({ success: true, key });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
