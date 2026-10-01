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
    include: { user: true, class: true, placement: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    cgpa,
    techStack,
    resumeUrl,
    profilePicUrl,
    targetRole,
    targetDomain,
    githubUrl,
    leetcodeUrl,
    gfgUrl,
    linkedinUrl,
    projects,
  } = body;

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const updated = await prisma.student.update({
    where: { id: student.id },
    data: {
      cgpa: cgpa !== undefined ? Number(cgpa) : undefined,
      techStack,
      resumeUrl,
      profilePicUrl,
      targetRole,
      targetDomain,
      githubUrl,
      leetcodeUrl,
      gfgUrl,
      linkedinUrl,
      projects,
    },
  });

  return NextResponse.json(updated);
}