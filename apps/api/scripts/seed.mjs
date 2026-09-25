import { PrismaClient, JobStatus } from '@prisma/client';

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

const prisma = new PrismaClient();

const templates = [
  ['Registered Nurse', 'Healthcare', 'Chicago', 'IL', 'On-site', 'Full-time'],
  ['School Psychologist', 'Education', 'Evanston', 'IL', 'Hybrid', 'Contract'],
  ['Behavioral Health Counselor', 'Behavioral Health', 'Oak Park', 'IL', 'On-site', 'Full-time'],
  ['Medical Assistant', 'Healthcare', 'Naperville', 'IL', 'On-site', 'Temporary'],
  ['Special Education Teacher', 'Education', 'Chicago', 'IL', 'On-site', 'Contract'],
  ['Case Manager', 'Behavioral Health', 'Chicago', 'IL', 'Hybrid', 'Full-time'],
  ['Operations Coordinator', 'Business Support', 'Schaumburg', 'IL', 'Hybrid', 'Full-time'],
  ['Speech-Language Pathologist', 'Education', 'Aurora', 'IL', 'On-site', 'Contract'],
  ['Licensed Practical Nurse', 'Healthcare', 'Joliet', 'IL', 'On-site', 'Part-time'],
  ['Recruiting Coordinator', 'Business Support', 'Remote', 'US', 'Remote', 'Full-time'],
  ['Occupational Therapist', 'Healthcare', 'Chicago', 'IL', 'Hybrid', 'Contract'],
  ['Paraprofessional', 'Education', 'Cicero', 'IL', 'On-site', 'Temporary'],
  ['Clinical Social Worker', 'Behavioral Health', 'Skokie', 'IL', 'Hybrid', 'Full-time'],
  ['Patient Access Representative', 'Healthcare', 'Chicago', 'IL', 'On-site', 'Full-time'],
  ['Executive Assistant', 'Business Support', 'Chicago', 'IL', 'Hybrid', 'Full-time'],
  ['Substitute Teacher', 'Education', 'Elgin', 'IL', 'On-site', 'Temporary'],
  ['Community Support Specialist', 'Behavioral Health', 'Chicago', 'IL', 'On-site', 'Full-time'],
  ['Data Entry Specialist', 'Business Support', 'Remote', 'US', 'Remote', 'Temporary'],
  ['Physical Therapist', 'Healthcare', 'Elmhurst', 'IL', 'On-site', 'Full-time'],
  ['School Nurse', 'Education', 'Oak Lawn', 'IL', 'On-site', 'Contract'],
];

async function main() {
  for (const [index, template] of templates.entries()) {
    const [title, industry, city, state, workplace, employmentType] = template;

    const slug =
      `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${index + 1}`;

    const jobData = {
      title,
      industry,
      city,
      state,
      workplace,
      employmentType,
      status: JobStatus.PUBLISHED,
      featured: index < 4,
      compensation: index % 3 === 0 ? '$32–$48 per hour' : null,
      summary:
        `Join a people-first organization as a ${title} and make a measurable difference every day.`,
      description:
        `Superior Staffing Solutions is seeking a dependable ${title} for a respected partner organization. This role combines meaningful work, responsive support, and a team committed to excellent outcomes.`,
      responsibilities: [
        'Deliver reliable, people-centered service',
        'Communicate clearly with clients and team members',
        'Maintain accurate documentation',
        'Follow organizational and regulatory standards',
      ],
      qualifications: [
        'Relevant professional experience or education',
        'Strong communication and organization skills',
        'Ability to work independently and collaboratively',
        'Required state credentials when applicable',
      ],
    };

    await prisma.job.upsert({
      where: { slug },
      update: jobData,
      create: {
        slug,
        ...jobData,
        publishedAt: new Date(Date.now() - index * 86_400_000),
      },
    });
  }

  console.log(`Production seed completed: ${templates.length} published jobs.`);
}

try {
  await main();
} catch (error) {
  console.error('Production seed failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
