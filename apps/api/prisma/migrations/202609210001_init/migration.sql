CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'REVIEWING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED');

CREATE TABLE "AdminUser" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Job" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "responsibilities" TEXT[] NOT NULL,
  "qualifications" TEXT[] NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "workplace" TEXT NOT NULL,
  "employmentType" TEXT NOT NULL,
  "industry" TEXT NOT NULL,
  "compensation" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "closesAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Candidate" (
  "id" TEXT PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "city" TEXT,
  "state" TEXT,
  "linkedInUrl" TEXT,
  "yearsExp" INTEGER,
  "skills" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Application" (
  "id" TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL REFERENCES "Job"("id") ON DELETE RESTRICT,
  "candidateId" TEXT NOT NULL REFERENCES "Candidate"("id") ON DELETE RESTRICT,
  "coverLetter" TEXT,
  "resumeObjectKey" TEXT NOT NULL,
  "resumeFileName" TEXT NOT NULL,
  "consentAt" TIMESTAMP(3) NOT NULL,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
  "source" TEXT NOT NULL DEFAULT 'website',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "TalentProfile" (
  "id" TEXT PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "preferredRoles" TEXT NOT NULL,
  "preferredArea" TEXT,
  "workPreference" TEXT,
  "resumeObjectKey" TEXT NOT NULL,
  "resumeFileName" TEXT NOT NULL,
  "consentAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EmployerRequest" (
  "id" TEXT PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "industry" TEXT NOT NULL,
  "rolesNeeded" TEXT NOT NULL,
  "headcount" INTEGER NOT NULL,
  "startTimeline" TEXT NOT NULL,
  "engagementType" TEXT NOT NULL,
  "additionalDetail" TEXT,
  "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
  "consentAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "Job_status_publishedAt_idx" ON "Job"("status", "publishedAt");
CREATE INDEX "Job_industry_idx" ON "Job"("industry");
CREATE INDEX "Job_city_state_idx" ON "Job"("city", "state");
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");
CREATE INDEX "Application_jobId_status_idx" ON "Application"("jobId", "status");
CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");
CREATE INDEX "TalentProfile_email_idx" ON "TalentProfile"("email");
CREATE INDEX "EmployerRequest_status_createdAt_idx" ON "EmployerRequest"("status", "createdAt");
