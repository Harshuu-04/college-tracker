import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId, fileUrl, fileType } = await req.json();
  
  if (!classId || !fileUrl || !fileType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const upload = await prisma.classStudentUpload.create({
    data: { classId, fileUrl, fileType },
  });

  return NextResponse.json({ upload });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.classStudentUpload.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
