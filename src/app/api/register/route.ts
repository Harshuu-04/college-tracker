import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, password, rollNo, classId } = await req.json();

  if (!name || !email || !password || !rollNo || !classId) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const existingRoll = await prisma.student.findUnique({ where: { rollNo } });
  if (existingRoll) {
    return NextResponse.json({ error: "Roll number already registered" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "STUDENT",
      student: {
        create: {
          rollNo,
          classId,
        },
      },
    },
  });

  return NextResponse.json({ success: true, userId: user.id });
}