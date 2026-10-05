import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const classNames = [
    "CSE 1", "CSE 2", "CSE 3", "CSE 4", "CSE Evening",
    "IT 1", "IT 2", "IT 3", "IT Evening",
    "ECE 1", "ECE 2", "ECE Evening",
    "EEE"
  ];

  try {
    const results = [];
    
    // 1. Create or update the new classes with batch 2028
    for (const name of classNames) {
      const exists = await prisma.class.findFirst({ where: { name } });
      if (!exists) {
        const created = await prisma.class.create({
          data: {
            name,
            year: 3,
            batch: "2028"
          }
        });
        results.push({ action: "created", name, id: created.id });
      } else {
        const updated = await prisma.class.update({
          where: { id: exists.id },
          data: { year: 3, batch: "2028" }
        });
        results.push({ action: "updated", name, id: updated.id });
      }
    }
    
    // 2. Remove 'CSE 3rd Year - A'
    const oldClass = await prisma.class.findFirst({ where: { name: "CSE 3rd Year - A" } });
    if (oldClass) {
      // Find a fallback class to move students to avoid foreign key constraints
      const fallbackClass = await prisma.class.findFirst({ where: { name: "CSE 1" } });
      if (fallbackClass) {
        // Move any existing students to CSE 1
        await prisma.student.updateMany({
          where: { classId: oldClass.id },
          data: { classId: fallbackClass.id }
        });
        
        // Move any drive eligibilities to CSE 1 (ignore duplicates if they fail, or just delete them)
        await prisma.driveEligibleClass.deleteMany({
          where: { classId: oldClass.id }
        });
      }
      
      await prisma.class.delete({ where: { id: oldClass.id } });
      results.push({ action: "deleted", name: "CSE 3rd Year - A" });
    }
    
    return NextResponse.json({ success: true, message: "Classes seeded successfully", results });
  } catch (error) {
    console.error("Failed to seed classes:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
