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

  const drives = await prisma.drive.findMany({
    include: {
      eligibleClasses: true,
      rounds: { orderBy: { order: "asc" } },
      registrations: { where: { studentId: student.id } },
    },
    orderBy: { registrationDeadline: "asc" },
  });

  const result = drives.map((drive) => {
    const classMatches = drive.eligibleClasses.some((ec) => ec.classId === student.classId);
    const cgpaOk = drive.minCgpa == null || (student.cgpa != null && student.cgpa >= drive.minCgpa);
    const backlogsOk =
      drive.maxBacklogs == null || (student.backlogs != null && student.backlogs <= drive.maxBacklogs);

    const isEligible = classMatches && cgpaOk && backlogsOk;
    const isRegistered = drive.registrations.length > 0;
    const isDeadlinePassed = new Date(drive.registrationDeadline) < new Date();

    return {
      id: drive.id,
      companyName: drive.companyName,
      role: drive.role,
      type: drive.type,
      packageLPA: drive.packageLPA,
      description: drive.description,
      driveDate: drive.driveDate,
      registrationDeadline: drive.registrationDeadline,
      minCgpa: drive.minCgpa,
      maxBacklogs: drive.maxBacklogs,
      isEligible,
      isRegistered,
      isDeadlinePassed,
    };
  });

  return NextResponse.json(result); 
}