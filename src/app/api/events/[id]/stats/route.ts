import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guestGroups, responses } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";

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

  const totalInvited = guests.reduce((sum, g) => sum + g.totalAllowed, 0);
  const totalGroups = guests.length;

  if (guests.length === 0) {
    return NextResponse.json({
      totalInvited: 0,
      totalGroups: 0,
      totalConfirmed: 0,
      totalDeclined: 0,
      totalPending: 0,
      respondedGroups: 0,
    });
  }

  const groupIds = guests.map((g) => g.id);
  const allResponses = await db
    .select()
    .from(responses)
    .where(inArray(responses.groupId, groupIds));

  const totalConfirmed = allResponses.filter((r) => r.isAttending).length;
  const totalDeclined = allResponses.filter((r) => !r.isAttending).length;
  const totalPending = totalInvited - totalConfirmed - totalDeclined;
  const respondedGroups = new Set(allResponses.map((r) => r.groupId)).size;

  return NextResponse.json({
    totalInvited,
    totalGroups,
    totalConfirmed,
    totalDeclined,
    totalPending: Math.max(0, totalPending),
    respondedGroups,
  });
}
