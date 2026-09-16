import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Clear existing data (safe for dev only)
  await prisma.attendance.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.marks.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  // Create teacher
  const teacherUser = await prisma.user.create({
    data: {
      email: "teacher@test.com",
      password: hashedPassword,
      name: "Test Teacher",
      role: "TEACHER",
      teacher: { create: {} },
    },
    include: { teacher: true },
  });

  // Create class, proctored by our teacher
  const cls = await prisma.class.create({
    data: {
      name: "CSE 3rd Year - A",
      proctorId: teacherUser.teacher!.id,
    },
  });

  // Create subject taught by our teacher, under this class
  const subject = await prisma.subject.create({
    data: {
      name: "Database Systems",
      classId: cls.id,
      teacherId: teacherUser.teacher!.id,
    },
  });

  // Create 5 students in this class
  const studentNames = ["Aarav Sharma", "Priya Patel", "Rohan Gupta", "Sneha Verma", "Kabir Singh"];

  for (let i = 0; i < studentNames.length; i++) {
    const studentUser = await prisma.user.create({
      data: {
        email: `student${i + 1}@test.com`,
        password: hashedPassword,
        name: studentNames[i],
        role: "STUDENT",
        student: {
          create: {
            rollNo: `CSE00${i + 1}`,
            classId: cls.id,
          },
        },
      },
    });
    console.log("Created student:", studentUser.email);
  }

  console.log("Seed complete!");
  console.log("Teacher login: teacher@test.com / password123");
  console.log("Student login: student1@test.com / password123 (through student5)");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());