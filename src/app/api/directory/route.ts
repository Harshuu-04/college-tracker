import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const classId = searchParams.get("classId") || "";

  const whereClause: any = {};
  
  if (classId) {
    whereClause.classId = classId;
  }
  
  if (search) {
    whereClause.OR = [
      { rollNo: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const students = await prisma.student.findMany({
    where: whereClause,
    include: {
      user: {
        select: { name: true, email: true }
      },
      class: {
        select: { name: true, batch: true }
      },
      placement: {
        select: { status: true, company: true }
      }
    },
    take: 200, // Increased limit to accommodate full class lists
    orderBy: { rollNo: "asc" },
  });

  return NextResponse.json(students);
}
