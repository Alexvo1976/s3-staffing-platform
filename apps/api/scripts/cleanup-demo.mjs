import { PrismaClient } from '@prisma/client';
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';

const DEMO_SOURCE = 'demo-seed-v1';
const DEMO_OBJECT_PREFIX = 'demo-seed/';

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) return;

  const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT = '5432',
    DB_NAME = 's3staffing',
  } = process.env;

  if (!DB_USER || !DB_PASSWORD || !DB_HOST) {
    throw new Error(
      'Database configuration is incomplete: DB_USER, DB_PASSWORD, and DB_HOST are required',
    );
  }

  process.env.DATABASE_URL =
    `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}` +
    `@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public&sslmode=require`;
}

ensureDatabaseUrl();

const bucketName = process.env.S3_BUCKET;
if (!bucketName) {
  throw new Error('S3_BUCKET is required to remove demo attachments.');
}

const prisma = new PrismaClient();
const s3 = new S3Client({});

async function deleteDemoObjects() {
  let continuationToken;
  let deleted = 0;

  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: DEMO_OBJECT_PREFIX,
        ContinuationToken: continuationToken,
      }),
    );
    const objects = (page.Contents ?? [])
      .filter((item) => item.Key)
      .map((item) => ({ Key: item.Key }));

    if (objects.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: { Objects: objects, Quiet: true },
        }),
      );
      deleted += objects.length;
    }

    continuationToken = page.NextContinuationToken;
  } while (continuationToken);

  return deleted;
}

async function main() {
  const deletedApplications = await prisma.application.deleteMany({
    where: { source: DEMO_SOURCE },
  });
  const deletedCandidates = await prisma.candidate.deleteMany({
    where: { email: { startsWith: 'demo.candidate.' } },
  });
  const deletedTalentProfiles = await prisma.talentProfile.deleteMany({
    where: { email: { startsWith: 'demo.talent.' } },
  });
  const deletedEmployerRequests = await prisma.employerRequest.deleteMany({
    where: { email: { startsWith: 'demo.employer.' } },
  });
  const deletedJobs = await prisma.job.deleteMany({
    where: { slug: { startsWith: 'demo-' } },
  });
  const deletedObjects = await deleteDemoObjects();

  console.log('Demo cleanup completed:', {
    applications: deletedApplications.count,
    candidates: deletedCandidates.count,
    talentProfiles: deletedTalentProfiles.count,
    employerRequests: deletedEmployerRequests.count,
    jobs: deletedJobs.count,
    s3Objects: deletedObjects,
  });
}

try {
  await main();
} catch (error) {
  console.error('Demo cleanup failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
