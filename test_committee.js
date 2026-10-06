const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  if (!user) {
    console.log("No student found");
    return;
  }
  try {
    const member = await prisma.committeeMember.upsert({
      where: { userId: user.id },
      update: { role: "STUDENT_COORDINATOR" },
      create: { userId: user.id, role: "STUDENT_COORDINATOR" },
    });
    console.log("Success:", member);
  } catch (error) {
    console.error("Error:", error);
  }
}

test().finally(() => prisma.$disconnect());
