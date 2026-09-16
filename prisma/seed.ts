import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "teacher@test.com",
      password: hashedPassword,
      name: "Test Teacher",
      role: "TEACHER",
      teacher: {
        create: {},
      },
    },
  });

  console.log("Created test user:", user.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());