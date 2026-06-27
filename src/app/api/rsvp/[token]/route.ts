import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guestGroups, events, responses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const [guest] = await db
    .select()
    .from(guestGroups)
    .where(eq(guestGroups.uniqueToken, token))
    .limit(1);

  if (!guest) return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, guest.eventId))
    .limit(1);

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Check existing responses
  const existingResponses = await db
    .select()
    .from(responses)
    .where(eq(responses.groupId, guest.id));

  return NextResponse.json({
    guest: {
      id: guest.id,
      groupName: guest.groupName,
      totalAllowed: guest.totalAllowed,
      status: guest.status,
    },
    event: {
      title: event.title,
      eventType: event.eventType,
      ownerName: event.ownerName,
      date: event.date,
      time: event.time,
      venue: event.venue,
      rsvpDeadline: event.rsvpDeadline,
    },
    existingResponses,
    hasResponded: existingResponses.length > 0,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const [guest] = await db
    .select()
    .from(guestGroups)
    .where(eq(guestGroups.uniqueToken, token))
    .limit(1);

  if (!guest) return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, guest.eventId))
    .limit(1);

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Check deadline
  const deadline = new Date(event.rsvpDeadline);
  deadline.setHours(23, 59, 59, 999);
  if (new Date() > deadline) {
    return NextResponse.json({ error: "RSVP deadline has passed" }, { status: 400 });
  }

  const body = await req.json();
  const { guests: guestList } = body as {
    guests: Array<{ name: string; isAttending: boolean }>;
  };

  if (!Array.isArray(guestList) || guestList.length === 0) {
    return NextResponse.json({ error: "No guest data provided" }, { status: 400 });
  }

  if (guestList.length > guest.totalAllowed) {
    return NextResponse.json(
      { error: `Max ${guest.totalAllowed} guests allowed` },
      { status: 400 }
    );
  }

  // Validate names for attending guests
  for (const g of guestList) {
    if (g.isAttending && (!g.name || g.name.trim() === "")) {
      return NextResponse.json(
        { error: "Name required for all attending guests" },
        { status: 400 }
      );
    }
  }

  // Delete previous responses and re-insert
  await db.delete(responses).where(eq(responses.groupId, guest.id));

  const toInsert = guestList
    .filter((g) => g.name && g.name.trim() !== "")
    .map((g) => ({
      groupId: guest.id,
      guestName: g.name.trim(),
      isAttending: g.isAttending,
    }));

  if (toInsert.length > 0) {
    await db.insert(responses).values(toInsert);
  }

  // Update guest group status
  await db
    .update(guestGroups)
    .set({ status: "Responded" })
    .where(eq(guestGroups.id, guest.id));

  return NextResponse.json({ success: true, message: "RSVP submitted successfully" });
}
