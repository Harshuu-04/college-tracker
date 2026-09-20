/*
  Warnings:

  - A unique constraint covering the columns `[studentId,subjectId,examType]` on the table `Marks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Marks_studentId_subjectId_examType_key" ON "Marks"("studentId", "subjectId", "examType");
