import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guestGroups, responses } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { generateToken } from "@/lib/token";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const guests = await db
    .select()
    .from(guestGroups)
    .where(eq(guestGroups.eventId, Number(id)));

  // Fetch responses for all groups
  if (guests.length === 0) return NextResponse.json([]);

  const groupIds = guests.map((g) => g.id);
  const allResponses = await db
    .select()
    .from(responses)
    .where(inArray(responses.groupId, groupIds));

  const responsesByGroup: Record<number, typeof allResponses> = {};
  allResponses.forEach((r) => {
    if (!responsesByGroup[r.groupId]) responsesByGroup[r.groupId] = [];
    responsesByGroup[r.groupId].push(r);
  });

  return NextResponse.json(
    guests.map((g) => ({ ...g, responses: responsesByGroup[g.id] ?? [] }))
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { groupName, phoneNumber, email, totalAllowed } = body;

  if (!groupName || !totalAllowed) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const token = generateToken();

  const [guest] = await db
    .insert(guestGroups)
    .values({
      eventId: Number(id),
      groupName,
      phoneNumber: phoneNumber ?? null,
      email: email ?? null,
      totalAllowed: Number(totalAllowed),
      uniqueToken: token,
      status: "Pending",
    })
    .returning();

  return NextResponse.json(guest, { status: 201 });
}
