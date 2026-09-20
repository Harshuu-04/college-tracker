import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectId, examType, marksMap, maxScore } = await req.json();
  // marksMap: { [studentId]: score }

  const records = Object.entries(marksMap).map(([studentId, score]) => ({
    studentId,
    subjectId,
    examType,
    score: Number(score),
    maxScore: Number(maxScore),
  }));

  await Promise.all(
    records.map((r) =>
      prisma.marks.upsert({
        where: {
          studentId_subjectId_examType: {
            studentId: r.studentId,
            subjectId: r.subjectId,
            examType: r.examType,
          },
        },
        update: { score: r.score, maxScore: r.maxScore },
        create: r,
      })
    )
  );

  return NextResponse.json({ success: true, count: records.length });
}