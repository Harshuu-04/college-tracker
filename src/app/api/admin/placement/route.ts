import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.student.findMany({
    include: {
      user: true,
      class: true,
      placement: true,
    },
    orderBy: { rollNo: "asc" },
  });

  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId, status, company, role } = await req.json();

  const placement = await prisma.placement.upsert({
    where: { studentId },
    update: { status, company, role },
    create: { studentId, status, company, role },
  });

  return NextResponse.json(placement);
}