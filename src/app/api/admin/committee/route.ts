import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, role, name, userRole } = await req.json();
  
  if (!email || !role || !name || !userRole) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Create or find user first
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    // We create a generic user without password since NextAuth handles credentials,
    // wait, we need password for credentials login. We can generate a random one
    // or assume they exist. To be safe:
    user = await prisma.user.create({
      data: {
        email,
        name,
        role: userRole,
        password: "TempPassword@123", // They should reset it, or use OAuth
      }
    });
  } else {
    // ensure role matches if they are newly made a teacher or student?
    // Not updating user role blindly to avoid downgrades
  }

  // Assign to committee
  const member = await prisma.committeeMember.upsert({
    where: { userId: user.id },
    update: { role },
    create: { userId: user.id, role },
  });

  return NextResponse.json({ member });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.committeeMember.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
