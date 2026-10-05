import { auth } from "@/../auth";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string; // "resume" | "profilePic" | "offerLetter"

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Basic validation
  const allowedTypes: Record<string, string[]> = {
    resume: ["application/pdf"],
    profilePic: ["image/jpeg", "image/png", "image/webp"],
    offerLetter: ["application/pdf", "image/jpeg", "image/png"],
    pastRecord: ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"],
    classUpload: ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"],
  };

  if (type && allowedTypes[type] && !allowedTypes[type].includes(file.type)) {
    return NextResponse.json(
      { error: `Invalid file type for ${type}. Allowed: ${allowedTypes[type].join(", ")}` },
      { status: 400 }
    );
  }

  const maxSizeMB = 5;
  if (file.size > maxSizeMB * 1024 * 1024) {
    return NextResponse.json({ error: `File too large. Max ${maxSizeMB}MB.` }, { status: 400 });
  }

  const filename = `${session.user.id}-${type}-${Date.now()}-${file.name}`;

  const blob = await put(filename, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}