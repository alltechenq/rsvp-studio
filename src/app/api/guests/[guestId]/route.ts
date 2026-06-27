import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guestGroups } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { guestId } = await params;
  const body = await req.json();
  const { groupName, phoneNumber, email, totalAllowed, status } = body;

  const [updated] = await db
    .update(guestGroups)
    .set({
      groupName,
      phoneNumber: phoneNumber ?? null,
      email: email ?? null,
      totalAllowed: Number(totalAllowed),
      status: status ?? "Pending",
    })
    .where(eq(guestGroups.id, Number(guestId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { guestId } = await params;
  await db.delete(guestGroups).where(eq(guestGroups.id, Number(guestId)));
  return NextResponse.json({ success: true });
}
