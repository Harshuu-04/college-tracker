import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

  const { status, company, role, packageLPA, offerLetterUrl } = await req.json();

  if ((status === "PLACED" || status === "INTERN") && !offerLetterUrl) {
    return NextResponse.json(
      { error: "Offer letter is required to mark yourself as Placed or Intern" },
      { status: 400 }
    );
  }

  const placement = await prisma.placement.upsert({
    where: { studentId: student.id },
    update: {
      status,
      company,
      role,
      packageLPA: packageLPA ? Number(packageLPA) : null,
      offerLetterUrl,
    },
    create: {
      studentId: student.id,
      status,
      company,
      role,
      packageLPA: packageLPA ? Number(packageLPA) : null,
      offerLetterUrl,
    },
  });

  return NextResponse.json(placement);
}