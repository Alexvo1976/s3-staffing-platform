import {
  PrismaClient,
  JobStatus,
  ApplicationStatus,
  RequestStatus,
} from '@prisma/client';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const DEMO_SOURCE = 'demo-seed-v1';
const DEMO_OBJECT_PREFIX = 'demo-seed';

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
  throw new Error('S3_BUCKET is required so demo attachments can be uploaded.');
}

const prisma = new PrismaClient();
const s3 = new S3Client({});

const jobTemplates = [
  ['Registered Nurse - Emergency Department', 'Healthcare', 'Chicago', 'IL', 'On-site', 'Full-time', JobStatus.PUBLISHED, '$42-$58 per hour'],
  ['School Social Worker', 'Education', 'Evanston', 'IL', 'Hybrid', 'Contract', JobStatus.PUBLISHED, '$40-$52 per hour'],
  ['Behavioral Health Technician', 'Behavioral Health', 'Oak Park', 'IL', 'On-site', 'Full-time', JobStatus.PUBLISHED, '$24-$31 per hour'],
  ['Bilingual Medical Assistant', 'Healthcare', 'Naperville', 'IL', 'On-site', 'Temporary', JobStatus.PUBLISHED, '$23-$29 per hour'],
  ['Special Education Teacher', 'Education', 'Chicago', 'IL', 'On-site', 'Contract', JobStatus.PUBLISHED, '$48-$61 per hour'],
  ['Clinical Case Manager', 'Behavioral Health', 'Chicago', 'IL', 'Hybrid', 'Full-time', JobStatus.PUBLISHED, '$68,000-$79,000 per year'],
  ['Human Resources Coordinator', 'Business Support', 'Schaumburg', 'IL', 'Hybrid', 'Full-time', JobStatus.PUBLISHED, '$52,000-$62,000 per year'],
  ['Speech-Language Pathologist', 'Education', 'Aurora', 'IL', 'On-site', 'Contract', JobStatus.PUBLISHED, '$52-$66 per hour'],
  ['Licensed Practical Nurse', 'Healthcare', 'Joliet', 'IL', 'On-site', 'Part-time', JobStatus.PUBLISHED, '$31-$39 per hour'],
  ['Talent Acquisition Specialist', 'Business Support', 'Remote', 'US', 'Remote', 'Full-time', JobStatus.PUBLISHED, '$62,000-$74,000 per year'],
  ['Occupational Therapist', 'Healthcare', 'Chicago', 'IL', 'Hybrid', 'Contract', JobStatus.PUBLISHED, '$50-$64 per hour'],
  ['Instructional Paraprofessional', 'Education', 'Cicero', 'IL', 'On-site', 'Temporary', JobStatus.PUBLISHED, '$21-$27 per hour'],
  ['Psychiatric Nurse Practitioner', 'Behavioral Health', 'Skokie', 'IL', 'Hybrid', 'Full-time', JobStatus.DRAFT, '$118,000-$138,000 per year'],
  ['Patient Services Supervisor', 'Healthcare', 'Chicago', 'IL', 'On-site', 'Full-time', JobStatus.DRAFT, '$58,000-$68,000 per year'],
  ['Executive Administrative Assistant', 'Business Support', 'Chicago', 'IL', 'Hybrid', 'Full-time', JobStatus.DRAFT, '$55,000-$65,000 per year'],
  ['Long-Term Substitute Teacher', 'Education', 'Elgin', 'IL', 'On-site', 'Temporary', JobStatus.DRAFT, '$220-$285 per day'],
  ['Community Outreach Coordinator', 'Behavioral Health', 'Chicago', 'IL', 'On-site', 'Full-time', JobStatus.DRAFT, '$49,000-$59,000 per year'],
  ['Remote Data Quality Specialist', 'Business Support', 'Remote', 'US', 'Remote', 'Temporary', JobStatus.DRAFT, '$22-$28 per hour'],
  ['Physical Therapist', 'Healthcare', 'Elmhurst', 'IL', 'On-site', 'Full-time', JobStatus.CLOSED, '$86,000-$101,000 per year'],
  ['School Nurse', 'Education', 'Oak Lawn', 'IL', 'On-site', 'Contract', JobStatus.CLOSED, '$39-$48 per hour'],
  ['Licensed Clinical Social Worker', 'Behavioral Health', 'Chicago', 'IL', 'Hybrid', 'Full-time', JobStatus.CLOSED, '$72,000-$84,000 per year'],
  ['Payroll Specialist', 'Business Support', 'Rosemont', 'IL', 'Hybrid', 'Full-time', JobStatus.CLOSED, '$57,000-$67,000 per year'],
  ['Radiologic Technologist', 'Healthcare', 'Des Plaines', 'IL', 'On-site', 'Part-time', JobStatus.CLOSED, '$35-$44 per hour'],
  ['Academic Interventionist', 'Education', 'Berwyn', 'IL', 'On-site', 'Contract', JobStatus.CLOSED, '$36-$46 per hour'],
];

const firstNames = [
  'Jordan', 'Taylor', 'Morgan', 'Cameron', 'Riley', 'Avery',
  'Casey', 'Quinn', 'Parker', 'Reese', 'Drew', 'Skyler',
];

const lastNames = [
  'Lee', 'Rivera', 'Johnson', 'Patel', 'Garcia', 'Nguyen',
  'Brown', 'Williams', 'Martinez', 'Davis', 'Wilson', 'Anderson',
];

const employerCompanies = [
  'Demo Lakeshore Medical Group',
  'Demo Northside Learning Center',
  'Demo Horizon Behavioral Services',
  'Demo Prairie Health Partners',
  'Demo Metro Charter Network',
  'Demo Community Wellness Alliance',
  'Demo BridgePoint Operations',
  'Demo Oak Valley Pediatrics',
  'Demo BrightPath Schools',
  'Demo Renewal Counseling Center',
  'Demo Skyline Business Services',
  'Demo Westbrook Rehabilitation',
  'Demo Lakeside Senior Care',
  'Demo Future Scholars Academy',
  'Demo Harbor Mental Health',
  'Demo Chicago Office Partners',
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function pdfEscape(value) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function createPdf(title, lines) {
  const safeLines = [title, '', ...lines].map((line) =>
    String(line).replace(/[^\x20-\x7E]/g, '-'),
  );
  const commands = [
    'BT',
    '/F1 12 Tf',
    '72 730 Td',
    ...safeLines.flatMap((line, index) => [
      `(${pdfEscape(line)}) Tj`,
      ...(index < safeLines.length - 1 ? ['0 -18 Td'] : []),
    ]),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(commands)} >>\nstream\n${commands}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let output = '%PDF-1.4\n';
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(output));
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(output);
  output += `xref\n0 ${objects.length + 1}\n`;
  output += '0000000000 65535 f \n';
  for (const offset of offsets.slice(1)) {
    output += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  output += `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(output);
}

async function uploadPdf(key, title, lines) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: createPdf(title, lines),
      ContentType: 'application/pdf',
      Metadata: {
        demo: 'true',
        source: DEMO_SOURCE,
      },
    }),
  );
}

function skillsForIndustry(industry) {
  const common = ['Communication', 'Documentation', 'Team collaboration'];
  const specialized = {
    Healthcare: ['Patient care', 'HIPAA awareness', 'Clinical workflow'],
    Education: ['Student support', 'IEP collaboration', 'Classroom management'],
    'Behavioral Health': ['Crisis intervention', 'Case planning', 'Trauma-informed care'],
    'Business Support': ['Microsoft 365', 'Scheduling', 'Process improvement'],
  };
  return [...common, ...(specialized[industry] ?? [])];
}

async function seedJobs() {
  const jobs = [];
  const now = Date.now();

  for (const [index, template] of jobTemplates.entries()) {
    const [title, industry, city, state, workplace, employmentType, status, compensation] = template;
    const slug = `demo-${slugify(title)}-${index + 1}`;
    const publishedAt = status === JobStatus.DRAFT
      ? null
      : new Date(now - (index + 3) * 86_400_000);
    const closesAt = status === JobStatus.CLOSED
      ? new Date(now - (index + 1) * 86_400_000)
      : index % 3 === 0 && status === JobStatus.PUBLISHED
        ? new Date(now + (30 + index) * 86_400_000)
        : null;
    const data = {
      title: `Demo - ${title}`,
      industry,
      city,
      state,
      workplace,
      employmentType,
      status,
      featured: status === JobStatus.PUBLISHED && index < 4,
      compensation,
      summary: `Demonstration opening for a ${title} supporting a respected partner organization.`,
      description: `This is a clearly labeled demonstration record for the Superior Staffing Solutions administrative workflow. The ${title} role represents realistic responsibilities, requirements, and hiring stages without identifying a real employer.`,
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
      publishedAt,
      closesAt,
    };

    const job = await prisma.job.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
    jobs.push(job);
  }

  return jobs;
}

async function seedCandidatesAndApplications(jobs) {
  const applicationStatuses = Object.values(ApplicationStatus);
  const publishedJobs = jobs.filter((job) => job.status === JobStatus.PUBLISHED);
  const historicalJobs = jobs.filter((job) => job.status === JobStatus.CLOSED);
  const total = 36;

  for (let index = 0; index < total; index += 1) {
    const number = String(index + 1).padStart(2, '0');
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[(index * 5) % lastNames.length];
    const email = `demo.candidate.${number}@example.test`;
    const job = index % 4 === 3
      ? historicalJobs[index % historicalJobs.length]
      : publishedJobs[index % publishedJobs.length];
    const skills = skillsForIndustry(job.industry);
    const candidateData = {
      firstName,
      middleName: index % 4 === 0 ? 'Demo' : null,
      lastName,
      phone: `312-555-${String(1100 + index)}`,
      streetAddress: `${100 + index} Demo Avenue`,
      city: index % 5 === 0 ? 'Evanston' : 'Chicago',
      state: 'IL',
      zipCode: index % 5 === 0 ? '60201' : '60601',
      linkedInUrl: `https://example.test/profiles/demo-candidate-${number}`,
      yearsExp: index % 13,
      skills,
      licensesCertifications: index % 3 === 0
        ? 'Demo professional license; CPR/BLS demonstration credential'
        : null,
      highestEducation: [
        'High school diploma',
        "Associate's degree",
        "Bachelor's degree",
        "Master's degree",
      ][index % 4],
    };

    const existingCandidate = await prisma.candidate.findFirst({ where: { email } });
    const candidate = existingCandidate
      ? await prisma.candidate.update({
          where: { id: existingCandidate.id },
          data: candidateData,
        })
      : await prisma.candidate.create({
          data: { email, ...candidateData },
        });

    const resumeObjectKey = `${DEMO_OBJECT_PREFIX}/resumes/demo-resume-${number}.pdf`;
    await uploadPdf(resumeObjectKey, `Demo Resume - ${firstName} ${lastName}`, [
      `Email: ${email}`,
      `Phone: ${candidateData.phone}`,
      `Location: ${candidateData.city}, ${candidateData.state}`,
      `Experience: ${candidateData.yearsExp} years`,
      `Skills: ${skills.join(', ')}`,
      '',
      'This document contains fictional demonstration data only.',
    ]);

    const licenseObjectKeys = [];
    const licenseFileNames = [];
    if (index % 3 === 0) {
      const key = `${DEMO_OBJECT_PREFIX}/licenses/demo-license-${number}.pdf`;
      await uploadPdf(key, `Demo License - ${firstName} ${lastName}`, [
        'Fictional credential for application workflow testing.',
        `Candidate: ${firstName} ${lastName}`,
      ]);
      licenseObjectKeys.push(key);
      licenseFileNames.push(`demo-license-${number}.pdf`);
    }

    const degreeObjectKeys = [];
    const degreeFileNames = [];
    if (index % 4 === 0) {
      const key = `${DEMO_OBJECT_PREFIX}/degrees/demo-degree-${number}.pdf`;
      await uploadPdf(key, `Demo Degree - ${firstName} ${lastName}`, [
        'Fictional education document for application workflow testing.',
        `Candidate: ${firstName} ${lastName}`,
      ]);
      degreeObjectKeys.push(key);
      degreeFileNames.push(`demo-degree-${number}.pdf`);
    }

    const status = applicationStatuses[index % applicationStatuses.length];
    const applicationData = {
      coverLetter: index % 2 === 0
        ? `This is a fictional demonstration cover letter for the ${job.title} workflow.`
        : null,
      resumeObjectKey,
      resumeFileName: `demo-resume-${number}.pdf`,
      licenseObjectKeys,
      licenseFileNames,
      degreeObjectKeys,
      degreeFileNames,
      placementType: ['Direct hire', 'Contract', 'Temporary'][index % 3],
      partTimeAvailability: index % 3 === 1 ? 'Weekdays after 1:00 PM' : null,
      availableStartDate: new Date(Date.now() + (7 + (index % 21)) * 86_400_000),
      backgroundClearance: index % 3 === 0 ? null : index % 3 === 1,
      workAuthorization: index % 11 !== 0,
      reliableTransportation: index % 5 !== 0,
      consentAt: new Date(Date.now() - (index + 1) * 3_600_000),
      status,
      source: DEMO_SOURCE,
      notes: `Demo scenario ${number}: ${status.toLowerCase()} application. No real applicant data.`,
    };

    const existingApplication = await prisma.application.findFirst({
      where: {
        candidateId: candidate.id,
        jobId: job.id,
        source: DEMO_SOURCE,
      },
    });

    if (existingApplication) {
      await prisma.application.update({
        where: { id: existingApplication.id },
        data: applicationData,
      });
    } else {
      await prisma.application.create({
        data: {
          jobId: job.id,
          candidateId: candidate.id,
          ...applicationData,
        },
      });
    }
  }
}

async function seedTalentProfiles() {
  const preferences = ['On-site', 'Hybrid', 'Remote'];

  for (let index = 0; index < 12; index += 1) {
    const number = String(index + 1).padStart(2, '0');
    const firstName = firstNames[(index + 3) % firstNames.length];
    const lastName = lastNames[(index + 7) % lastNames.length];
    const email = `demo.talent.${number}@example.test`;
    const resumeObjectKey = `${DEMO_OBJECT_PREFIX}/talent/demo-talent-${number}.pdf`;
    const data = {
      firstName,
      lastName,
      phone: `773-555-${String(2100 + index)}`,
      preferredRoles: jobTemplates[index % jobTemplates.length][0],
      preferredArea: index % 4 === 0 ? 'Remote - United States' : 'Chicago, IL',
      workPreference: preferences[index % preferences.length],
      resumeObjectKey,
      resumeFileName: `demo-talent-${number}.pdf`,
      consentAt: new Date(Date.now() - (index + 2) * 7_200_000),
    };

    await uploadPdf(resumeObjectKey, `Demo Talent Profile - ${firstName} ${lastName}`, [
      `Email: ${email}`,
      `Phone: ${data.phone}`,
      `Preferred role: ${data.preferredRoles}`,
      `Work preference: ${data.workPreference}`,
      '',
      'This document contains fictional demonstration data only.',
    ]);

    const existing = await prisma.talentProfile.findFirst({ where: { email } });
    if (existing) {
      await prisma.talentProfile.update({ where: { id: existing.id }, data });
    } else {
      await prisma.talentProfile.create({ data: { email, ...data } });
    }
  }
}

async function seedEmployerRequests() {
  const requestStatuses = Object.values(RequestStatus);

  for (const [index, companyName] of employerCompanies.entries()) {
    const number = String(index + 1).padStart(2, '0');
    const email = `demo.employer.${number}@example.test`;
    const template = jobTemplates[index % jobTemplates.length];
    const data = {
      companyName,
      contactName: `Demo Contact ${number}`,
      phone: `847-555-${String(3100 + index)}`,
      industry: template[1],
      rolesNeeded: template[0],
      headcount: 1 + (index % 12),
      startTimeline: [
        'Immediately',
        'Within 2 weeks',
        'Within 30 days',
        'Next quarter',
      ][index % 4],
      engagementType: ['Direct hire', 'Contract', 'Temporary', 'Contract-to-hire'][index % 4],
      additionalDetail: index % 3 === 0
        ? 'Demo request requiring bilingual candidates and weekend availability.'
        : 'Fictional employer request created for administrative workflow testing.',
      status: requestStatuses[index % requestStatuses.length],
      consentAt: new Date(Date.now() - (index + 1) * 10_800_000),
    };

    const existing = await prisma.employerRequest.findFirst({ where: { email } });
    if (existing) {
      await prisma.employerRequest.update({ where: { id: existing.id }, data });
    } else {
      await prisma.employerRequest.create({ data: { email, ...data } });
    }
  }
}

async function main() {
  console.log(`Starting ${DEMO_SOURCE} against bucket ${bucketName}...`);
  const jobs = await seedJobs();
  await seedCandidatesAndApplications(jobs);
  await seedTalentProfiles();
  await seedEmployerRequests();

  const summary = {
    jobs: await prisma.job.count({ where: { slug: { startsWith: 'demo-' } } }),
    applications: await prisma.application.count({ where: { source: DEMO_SOURCE } }),
    candidates: await prisma.candidate.count({
      where: { email: { startsWith: 'demo.candidate.' } },
    }),
    talentProfiles: await prisma.talentProfile.count({
      where: { email: { startsWith: 'demo.talent.' } },
    }),
    employerRequests: await prisma.employerRequest.count({
      where: { email: { startsWith: 'demo.employer.' } },
    }),
  };

  console.log('Demo seed completed successfully:', summary);
}

try {
  await main();
} catch (error) {
  console.error('Demo seed failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
