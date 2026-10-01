-- CreateEnum
CREATE TYPE "DriveType" AS ENUM ('FULL_TIME', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('PENDING', 'CLEARED', 'REJECTED');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "backlogs" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "Drive" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "type" "DriveType" NOT NULL,
    "packageLPA" DOUBLE PRECISION,
    "description" TEXT,
    "driveDate" TIMESTAMP(3),
    "registrationDeadline" TIMESTAMP(3) NOT NULL,
    "minCgpa" DOUBLE PRECISION,
    "maxBacklogs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriveEligibleClass" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "DriveEligibleClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriveRound" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "DriveRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriveRegistration" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriveRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundResult" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "RoundResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriveEligibleClass_driveId_classId_key" ON "DriveEligibleClass"("driveId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "DriveRegistration_driveId_studentId_key" ON "DriveRegistration"("driveId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundResult_roundId_studentId_key" ON "RoundResult"("roundId", "studentId");

-- AddForeignKey
ALTER TABLE "DriveEligibleClass" ADD CONSTRAINT "DriveEligibleClass_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "Drive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveEligibleClass" ADD CONSTRAINT "DriveEligibleClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveRound" ADD CONSTRAINT "DriveRound_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "Drive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveRegistration" ADD CONSTRAINT "DriveRegistration_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "Drive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriveRegistration" ADD CONSTRAINT "DriveRegistration_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundResult" ADD CONSTRAINT "RoundResult_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "DriveRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundResult" ADD CONSTRAINT "RoundResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
