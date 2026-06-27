import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guestGroups, events } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sendEmail, buildInvitationEmailHtml } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { guestId } = await params;
  const body = await req.json();
  const { isRsvp } = body as { isRsvp: boolean };

  const [guest] = await db
    .select()
    .from(guestGroups)
    .where(eq(guestGroups.id, Number(guestId)))
    .limit(1);

  if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  if (!guest.email) return NextResponse.json({ error: "No email address" }, { status: 400 });

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, guest.eventId))
    .limit(1);

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const rsvpUrl = `${baseUrl}/rsvp/${guest.uniqueToken}`;

  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [hours, minutes] = event.time.split(":");
  const timeObj = new Date();
  timeObj.setHours(Number(hours), Number(minutes));
  const eventTime = timeObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const { subject, html } = buildInvitationEmailHtml({
    groupName: guest.groupName,
    ownerName: event.ownerName,
    eventType: event.eventType,
    eventDate,
    eventTime,
    venue: event.venue,
    rsvpUrl,
    isRsvp,
  });

  try {
    await sendEmail({ to: guest.email, subject, html });

    // Update status
    await db
      .update(guestGroups)
      .set({ status: "Sent" })
      .where(eq(guestGroups.id, Number(guestId)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
