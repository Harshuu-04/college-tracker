import { auth } from "@/../auth";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drives = await prisma.drive.findMany({
    include: {
      eligibleClasses: { include: { class: true } },
      rounds: { orderBy: { order: "asc" } },
      registrations: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(drives);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    companyName,
    role,
    type,
    packageLPA,
    description,
    driveDate,
    registrationDeadline,
    minCgpa,
    maxBacklogs,
    classIds,
    roundNames,
  } = await req.json();

  if (!companyName || !role || !type || !registrationDeadline || !classIds?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const drive = await prisma.drive.create({
    data: {
      companyName,
      role,
      type,
      packageLPA: packageLPA ? Number(packageLPA) : null,
      description,
      driveDate: driveDate ? new Date(driveDate) : null,
      registrationDeadline: new Date(registrationDeadline),
      minCgpa: minCgpa ? Number(minCgpa) : null,
      maxBacklogs: maxBacklogs !== "" && maxBacklogs !== undefined ? Number(maxBacklogs) : null,
      eligibleClasses: {
        create: classIds.map((classId: string) => ({ classId })),
      },
      rounds: {
        create: (roundNames as string[]).map((name, index) => ({
          name,
          order: index + 1,
        })),
      },
    },
  });

    // Find eligible students and notify them
  const eligibleStudents = await prisma.student.findMany({
    where: {
      classId: { in: classIds },
      ...(minCgpa ? { cgpa: { gte: Number(minCgpa) } } : {}),
      ...(maxBacklogs !== "" && maxBacklogs !== undefined
        ? { backlogs: { lte: Number(maxBacklogs) } }
        : {}),
    },
    include: { user: true },
  });

  const emails = eligibleStudents.map((s) => s.user.email);

  await sendEmail(
    emails,
    `New Placement Drive: ${companyName} - ${role}`,
    `
      <h2>${companyName} is hiring for ${role}</h2>
      <p>${description || ""}</p>
      <p><strong>Type:</strong> ${type === "FULL_TIME" ? "Full Time" : "Internship"}</p>
      ${packageLPA ? `<p><strong>Package:</strong> ${packageLPA} LPA</p>` : ""}
      <p><strong>Registration Deadline:</strong> ${new Date(registrationDeadline).toLocaleString()}</p>
      <p>Log in to the placement portal to register.</p>
    `
  );

  return NextResponse.json(drive);
}