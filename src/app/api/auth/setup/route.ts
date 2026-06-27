import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admin } from "@/db/schema";
import bcrypt from "bcryptjs";

// One-time setup endpoint to seed the admin account.
// In production, disable or protect this route.
export async function POST(req: NextRequest) {
  try {
    const { username, password, setupKey } = await req.json();

    if (setupKey !== (process.env.SETUP_KEY ?? "rsvp-setup-2024")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const existing = await db.select().from(admin).limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Admin already exists" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    await db.insert(admin).values({ username, password: hashed });

    return NextResponse.json({ success: true, message: "Admin created" });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
