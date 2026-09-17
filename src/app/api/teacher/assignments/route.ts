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

  const { title, dueDate, subjectId } = await req.json();

  // Create the assignment
  const assignment = await prisma.assignment.create({
    data: {
      title,
      dueDate: new Date(dueDate),
      subjectId,
      teacherId: teacher.id,
    },
  });

  // Auto-create a "NOT_SUBMITTED" submission row for every student in that subject's class
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: { class: { include: { students: true } } },
  });

  if (subject) {
    await prisma.submission.createMany({
      data: subject.class.students.map((s) => ({
        assignmentId: assignment.id,
        studentId: s.id,
        status: "NOT_SUBMITTED" as const,
      })),
    });
  }

  return NextResponse.json(assignment);
}

export async function GET() {
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

  const assignments = await prisma.assignment.findMany({
    where: { teacherId: teacher.id },
    include: {
      subject: true,
      submissions: { include: { student: { include: { user: true } } } },
    },
    orderBy: { dueDate: "desc" },
  });

  return NextResponse.json(assignments);
}