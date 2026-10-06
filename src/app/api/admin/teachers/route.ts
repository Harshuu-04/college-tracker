import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const whereClause: any = {
    role: "TEACHER"
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const teachers = await prisma.user.findMany({
    where: whereClause,
    include: {
      teacher: {
        include: {
          proctorOfClass: true
        }
      },
      committeeMember: true
    },
    orderBy: { name: "asc" }
  });

  return NextResponse.json(teachers);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name, password } = await req.json();

  if (!email || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      password: password || "Teacher@123",
      role: "TEACHER",
      teacher: {
        create: {}
      }
    }
  });

  return NextResponse.json(newUser);
}

