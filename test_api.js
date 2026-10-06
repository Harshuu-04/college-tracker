const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const students = await prisma.student.findMany({
    where: {
      OR: [
        { rollNo: { contains: "test", mode: 'insensitive' } },
        { user: { name: { contains: "test", mode: 'insensitive' } } },
        { user: { email: { contains: "test", mode: 'insensitive' } } }
      ]
    },
    include: { user: true }
  });
  console.log(students);
}

test().catch(console.error).finally(() => prisma.$disconnect());
