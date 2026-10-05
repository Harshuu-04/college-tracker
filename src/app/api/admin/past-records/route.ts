import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { year, fileUrl } = await req.json();
  
  if (!year || !fileUrl) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const record = await prisma.pastPlacementRecord.upsert({
    where: { year: parseInt(year) },
    update: { fileUrl },
    create: { year: parseInt(year), fileUrl },
  });

  return NextResponse.json({ record });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.pastPlacementRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
