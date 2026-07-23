import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { rosterEntries } from "@/lib/db/schema"
import { inArray } from "drizzle-orm"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keys = searchParams.get("keys")?.split(",").filter(Boolean) ?? []

  if (keys.length === 0) {
    return NextResponse.json([])
  }

  const rows = await db
    .select()
    .from(rosterEntries)
    .where(inArray(rosterEntries.dayKey, keys))

  return NextResponse.json(rows)
}
