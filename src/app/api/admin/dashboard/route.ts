import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [committee, pastRecords, classUploads, classes] = await Promise.all([
    prisma.committeeMember.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    }),
    prisma.pastPlacementRecord.findMany({
      orderBy: { year: "desc" },
    }),
    prisma.classStudentUpload.findMany({
      include: { class: { select: { name: true, year: true, batch: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.class.findMany({
      orderBy: { name: "asc" }
    }),
  ]);

  return NextResponse.json({ committee, pastRecords, classUploads, classes });
}
