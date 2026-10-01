import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      subjects: true,
      students: {
        include: {
          user: true,
          attendance: true,
        },
      },
    },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Build CSV header: Roll No, Name, Subject1 %, Subject2 %, ..., Overall %
  const header = ["Roll No", "Name", ...cls.subjects.map((s) => s.name), "Overall %"];

  const rows = cls.students.map((student) => {
    const row: (string | number)[] = [student.rollNo, student.user.name];

    let totalPresent = 0;
    let totalClasses = 0;

    cls.subjects.forEach((subject) => {
      const records = student.attendance.filter((a) => a.subjectId === subject.id);
      const total = records.length;
      const present = records.filter((r) => r.status === "PRESENT").length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 0;
      row.push(`${pct}%`);
      totalPresent += present;
      totalClasses += total;
    });

    const overallPct = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
    row.push(`${overallPct}%`);

    return row;
  });

  // Convert to CSV string
  const csvRows = [header, ...rows].map((row) => row.join(","));
  const csv = csvRows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="attendance-${cls.name.replace(/\s+/g, "_")}.csv"`,
    },
  });
}