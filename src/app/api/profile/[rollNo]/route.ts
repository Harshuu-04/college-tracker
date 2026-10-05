import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ rollNo: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rollNo } = await params;

  let student = await prisma.student.findUnique({
    where: { rollNo },
    include: { user: true, class: true, placement: true },
  });

  if (!student) {
    // Fallback: If rollNo wasn't found, the string might actually be a userId from an old session
    student = await prisma.student.findUnique({
      where: { userId: rollNo },
      include: { user: true, class: true, placement: true },
    });
  }

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}