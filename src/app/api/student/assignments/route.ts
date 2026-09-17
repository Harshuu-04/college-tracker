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
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const submissions = await prisma.submission.findMany({
    where: { studentId: student.id },
    include: {
      assignment: { include: { subject: true } },
    },
    orderBy: { assignment: { dueDate: "desc" } },
  });

  return NextResponse.json(submissions);
}