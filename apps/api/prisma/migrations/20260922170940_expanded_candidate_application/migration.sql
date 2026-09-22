-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "availableStartDate" TIMESTAMP(3),
ADD COLUMN     "backgroundClearance" BOOLEAN,
ADD COLUMN     "degreeFileNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "degreeObjectKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "licenseFileNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "licenseObjectKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "partTimeAvailability" TEXT,
ADD COLUMN     "placementType" TEXT,
ADD COLUMN     "reliableTransportation" BOOLEAN,
ADD COLUMN     "workAuthorization" BOOLEAN;

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "highestEducation" TEXT,
ADD COLUMN     "licensesCertifications" TEXT,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "streetAddress" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
