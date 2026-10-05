import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      committeeMember: true,
      teacher: {
        include: {
          proctorOfClass: true,
        }
      }
    }
  });

  if (!user || !user.committeeMember) {
    return NextResponse.json({ error: "Not assigned to committee" }, { status: 400 });
  }

  const committeeRole = user.committeeMember.role;
  let students = [];
  let pastRecords = [];
  let classUploads = [];

  if (committeeRole === "CONVENER" || committeeRole === "CO_CONVENER") {
    // Has full access
    students = await prisma.student.findMany({
      include: { user: true, class: true, placement: true },
      orderBy: { rollNo: "asc" },
    });
    pastRecords = await prisma.pastPlacementRecord.findMany({ orderBy: { year: "desc" }});
    classUploads = await prisma.classStudentUpload.findMany({ include: { class: true }, orderBy: { createdAt: "desc" }});
  } else if (committeeRole === "FACULTY_COORDINATOR") {
    // Only access to their class
    const teacherClasses = user.teacher?.proctorOfClass.map(c => c.id) || [];
    if (teacherClasses.length > 0) {
      students = await prisma.student.findMany({
        where: { classId: { in: teacherClasses } },
        include: { user: true, class: true, placement: true },
        orderBy: { rollNo: "asc" },
      });
      classUploads = await prisma.classStudentUpload.findMany({
        where: { classId: { in: teacherClasses } },
        include: { class: true },
        orderBy: { createdAt: "desc" }
      });
    }
  }

  return NextResponse.json({
    role: committeeRole,
    classesManaged: user.teacher?.proctorOfClass || [],
    students,
    pastRecords,
    classUploads
  });
}

export async function POST(req: Request) {
  // Update placement status for a student
  const session = await auth();

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId, status, company, packageLPA } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      committeeMember: true,
      teacher: { include: { proctorOfClass: true } }
    }
  });

  if (!user || !user.committeeMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const role = user.committeeMember.role;
  
  if (role === "FACULTY_COORDINATOR") {
    const isProctor = user.teacher?.proctorOfClass.some(c => c.id === student.classId);
    if (!isProctor) {
      return NextResponse.json({ error: "You can only edit your own class students." }, { status: 403 });
    }
  }

  const placement = await prisma.placement.upsert({
    where: { studentId },
    update: { status, company, packageLPA: packageLPA ? parseFloat(packageLPA) : null },
    create: { studentId, status, company, packageLPA: packageLPA ? parseFloat(packageLPA) : null },
  });

  return NextResponse.json(placement);
}
