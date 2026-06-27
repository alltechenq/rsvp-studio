import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allEvents = await db.select().from(events).orderBy(desc(events.createdAt));
  return NextResponse.json(allEvents);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      title,
      eventType,
      ownerName,
      date,
      time,
      venue,
      rsvpDeadline,
      emailSubject,
      emailBody,
      saveDateMessage,
      rsvpMessage,
    } = body;

    if (!title || !eventType || !ownerName || !date || !time || !venue || !rsvpDeadline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [event] = await db
      .insert(events)
      .values({
        title,
        eventType,
        ownerName,
        date,
        time,
        venue,
        rsvpDeadline,
        emailSubject: emailSubject ?? null,
        emailBody: emailBody ?? null,
        saveDateMessage: saveDateMessage ?? null,
        rsvpMessage: rsvpMessage ?? null,
      })
      .returning();

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    console.error("Create event error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
