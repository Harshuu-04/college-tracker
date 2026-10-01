-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "batch" TEXT,
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "Placement" ADD COLUMN     "offerLetterUrl" TEXT,
ADD COLUMN     "packageLPA" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "cgpa" DOUBLE PRECISION,
ADD COLUMN     "gfgUrl" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "leetcodeUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "profilePicUrl" TEXT,
ADD COLUMN     "projects" TEXT,
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "targetDomain" TEXT,
ADD COLUMN     "targetRole" TEXT,
ADD COLUMN     "techStack" TEXT;
