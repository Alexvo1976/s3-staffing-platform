import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ApplicationForm from '@/components/ApplicationForm';
import { api, type Job } from '@/lib/api';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { try { const job = await api<Job>(`/jobs/${(await params).id}`); return { title: job.title, description: job.summary }; } catch { return { title: 'Job opportunity' }; } }

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  let job: Job; try { job = await api<Job>(`/jobs/${(await params).id}`); } catch { notFound(); }
  return <main className="section page-bg"><div className="shell job-detail"><article><p className="kicker blue">{job.industry}</p><h1>{job.title}</h1><div className="jobmeta"><span className="pill">{job.city}, {job.state}</span><span className="pill">{job.workplace}</span><span className="pill">{job.employmentType}</span></div>{job.compensation && <p className="compensation">{job.compensation}</p>}<p className="lead">{job.description}</p><h2>What you’ll do</h2><ul>{job.responsibilities?.map((item) => <li key={item}>{item}</li>)}</ul><h2>What you’ll bring</h2><ul>{job.qualifications?.map((item) => <li key={item}>{item}</li>)}</ul><p className="eeo">Superior Staffing Solutions is an Equal Opportunity Employer. Employment decisions are made without regard to protected characteristics.</p></article><ApplicationForm jobId={job.id} jobTitle={job.title}/></div></main>;
}
