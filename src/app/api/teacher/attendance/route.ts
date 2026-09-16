import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const body = await req.json();
  const { subjectId, date, attendanceMap } = body;
  // attendanceMap: { [studentId]: "PRESENT" | "ABSENT" }

  const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
    studentId,
    subjectId,
    teacherId: teacher.id,
    date: new Date(date),
    status: status as "PRESENT" | "ABSENT",
  }));

  // Upsert each record (so re-saving the same day updates instead of duplicating)
  await Promise.all(
    records.map((record) =>
      prisma.attendance.upsert({
        where: {
          studentId_subjectId_date: {
            studentId: record.studentId,
            subjectId: record.subjectId,
            date: record.date,
          },
        },
        update: { status: record.status, teacherId: record.teacherId },
        create: record,
      })
    )
  );

  return NextResponse.json({ success: true, count: records.length });
}