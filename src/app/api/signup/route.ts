import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, businessType, instagramHandle, goals } = body;

    if (!name || !email || !businessType || !instagramHandle) {
      return NextResponse.json(
        { error: "Name, email, business type, and Instagram handle are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check beta capacity
    const count = db
      .prepare("SELECT COUNT(*) as count FROM beta_signups")
      .get() as { count: number };

    if (count.count >= 50) {
      return NextResponse.json(
        { error: "Beta is currently full. Join the waitlist and we'll notify you when spots open." },
        { status: 409 }
      );
    }

    // Check for duplicate email
    const existing = db
      .prepare("SELECT id FROM beta_signups WHERE email = ?")
      .get(email);

    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered for the beta." },
        { status: 409 }
      );
    }

    // Sanitize Instagram handle
    const handle = instagramHandle.startsWith("@")
      ? instagramHandle
      : `@${instagramHandle}`;

    db.prepare(
      `INSERT INTO beta_signups (name, email, business_type, instagram_handle, goals)
       VALUES (?, ?, ?, ?, ?)`
    ).run(name, email, businessType, handle, goals || null);

    return NextResponse.json(
      { message: "Welcome to the ReelIntel beta! Check your email for next steps." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDb();
    const count = db
      .prepare("SELECT COUNT(*) as count FROM beta_signups")
      .get() as { count: number };

    return NextResponse.json({
      spotsTotal: 50,
      spotsTaken: count.count,
      spotsRemaining: 50 - count.count,
    });
  } catch {
    return NextResponse.json({ spotsTotal: 50, spotsTaken: 0, spotsRemaining: 50 });
  }
}
