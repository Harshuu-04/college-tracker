import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId, status } = await req.json();

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: { status },
  });

  return NextResponse.json(updated);
}