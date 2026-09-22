import { PrismaClient, ApplicationStatus, JobStatus, RequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
] as const;

async function main() {
  const email = (process.env.LOCAL_ADMIN_EMAIL ?? 'admin@s3staffing.local').toLowerCase();
  const password = process.env.LOCAL_ADMIN_PASSWORD ?? 'ChangeMe-Local-Only-123!';
  await prisma.adminUser.upsert({ where: { email }, update: { passwordHash: await bcrypt.hash(password, 12), active: true }, create: { email, passwordHash: await bcrypt.hash(password, 12), name: 'S3 Administrator' } });

  const jobs = [];
  for (const [index, [title, industry, city, state, workplace, employmentType]] of templates.entries()) {
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${index + 1}`;
    jobs.push(await prisma.job.upsert({ where: { slug }, update: {}, create: {
      slug, title, industry, city, state, workplace, employmentType, status: JobStatus.PUBLISHED,
      featured: index < 4, compensation: index % 3 === 0 ? '$32–$48 per hour' : undefined,
      summary: `Join a people-first organization as a ${title} and make a measurable difference every day.`,
      description: `Superior Staffing Solutions is seeking a dependable ${title} for a respected partner organization. This role combines meaningful work, responsive support, and a team committed to excellent outcomes.`,
      responsibilities: ['Deliver reliable, people-centered service', 'Communicate clearly with clients and team members', 'Maintain accurate documentation', 'Follow organizational and regulatory standards'],
      qualifications: ['Relevant professional experience or education', 'Strong communication and organization skills', 'Ability to work independently and collaboratively', 'Required state credentials when applicable'],
      publishedAt: new Date(Date.now() - index * 86_400_000),
    } }));
  }

  const statuses = Object.values(ApplicationStatus);
  const firstNames = ['Jordan', 'Taylor', 'Morgan', 'Cameron', 'Riley', 'Avery', 'Casey', 'Quinn'];
  const lastNames = ['Lee', 'Rivera', 'Johnson', 'Patel'];
  for (let index = 0; index < 32; index++) {
    const marker = `demo-${index + 1}@example.test`;
    const existing = await prisma.candidate.findFirst({ where: { email: marker } });
    const candidate = existing ?? await prisma.candidate.create({ data: { firstName: firstNames[index % firstNames.length], lastName: lastNames[index % lastNames.length], email: marker, phone: `312-555-${String(1000 + index)}`, city: 'Chicago', state: 'IL', yearsExp: 2 + (index % 12), skills: ['Communication', 'Documentation', templates[index % templates.length][0]] } });
    const duplicate = await prisma.application.findFirst({ where: { candidateId: candidate.id, jobId: jobs[index % jobs.length].id } });
    if (!duplicate) await prisma.application.create({ data: { candidateId: candidate.id, jobId: jobs[index % jobs.length].id, resumeObjectKey: `demo/resume-${index + 1}.pdf`, resumeFileName: `sample-resume-${index + 1}.pdf`, consentAt: new Date(), status: statuses[index % statuses.length], source: 'seed' } });
  }

  for (let index = 0; index < 12; index++) {
    const emailKey = `contact-${index + 1}@employer.example.test`;
    const exists = await prisma.employerRequest.findFirst({ where: { email: emailKey } });
    if (!exists) await prisma.employerRequest.create({ data: { companyName: `Demo Partner ${index + 1}`, contactName: `Employer Contact ${index + 1}`, email: emailKey, phone: `773-555-${String(2000 + index)}`, industry: templates[index % templates.length][1], rolesNeeded: templates[index % templates.length][0], headcount: 1 + (index % 8), startTimeline: 'Within 30 days', engagementType: index % 2 ? 'Contract' : 'Direct hire', status: Object.values(RequestStatus)[index % 4], consentAt: new Date() } });
  }

  console.log(`Seeded ${jobs.length} jobs, 32 candidate applications, 12 employer requests, and local admin ${email}`);
}

main().finally(() => prisma.$disconnect());
