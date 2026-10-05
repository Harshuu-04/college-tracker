import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, password, role, rollNo, classId, accessCode, teacherRole, teacherClassId } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Name, email, password, and role are required" }, { status: 400 });
  }

  // Security check
  if (role === "ADMIN" && accessCode !== "MSIT-ADMIN-2026") {
    return NextResponse.json({ error: "Invalid admin access code" }, { status: 403 });
  }
  if (role === "TEACHER" && accessCode !== "MSIT-TEACHER-2026") {
    return NextResponse.json({ error: "Invalid teacher access code" }, { status: 403 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (role === "STUDENT") {
    if (!rollNo || !classId) {
      return NextResponse.json({ error: "Roll number and class are required for students" }, { status: 400 });
    }
    const existingRoll = await prisma.student.findUnique({ where: { rollNo } });
    if (existingRoll) {
      return NextResponse.json({ error: "Roll number already registered" }, { status: 400 });
    }
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
        student: {
          create: { rollNo, classId },
        },
      },
    });
    return NextResponse.json({ success: true, userId: user.id });
  } 
  
  else if (role === "TEACHER") {
    if (!teacherRole) {
      return NextResponse.json({ error: "Teacher committee role is required" }, { status: 400 });
    }
    if (teacherRole === "FACULTY_COORDINATOR" && !teacherClassId) {
      return NextResponse.json({ error: "Class assignment is required for Faculty Coordinators" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TEACHER",
        teacher: {
          create: {}
        },
        committeeMember: {
          create: {
            role: teacherRole
          }
        }
      },
    });

    if (teacherRole === "FACULTY_COORDINATOR" && teacherClassId) {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
      if (teacher) {
        await prisma.class.update({
          where: { id: teacherClassId },
          data: { proctorId: teacher.id }
        });
      }
    }

    return NextResponse.json({ success: true, userId: user.id });
  }

  else if (role === "ADMIN") {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    return NextResponse.json({ success: true, userId: user.id });
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 400 });
}