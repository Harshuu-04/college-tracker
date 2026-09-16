import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      class: {
        include: { subjects: true },
      },
      attendance: true,
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Build subject-wise stats
  const subjectStats = student.class.subjects.map((subject) => {
    const records = student.attendance.filter((a) => a.subjectId === subject.id);
    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalClasses: total,
      present,
      percentage,
    };
  });

  const overallTotal = student.attendance.length;
  const overallPresent = student.attendance.filter((a) => a.status === "PRESENT").length;
  const overallPercentage =
    overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;

  return NextResponse.json({
    overall: {
      total: overallTotal,
      present: overallPresent,
      percentage: overallPercentage,
    },
    subjects: subjectStats,
  });
}