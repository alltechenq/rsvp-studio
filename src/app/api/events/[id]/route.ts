import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [event] = await db.select().from(events).where(eq(events.id, Number(id))).limit(1);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(event);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
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

  const [updated] = await db
    .update(events)
    .set({
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
    .where(eq(events.id, Number(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(events).where(eq(events.id, Number(id)));
  return NextResponse.json({ success: true });
}
