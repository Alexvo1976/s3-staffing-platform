import type { Metadata } from 'next';
import Link from 'next/link';
import { api, type Job } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Job opportunities' };

export default async function JobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams; const query = new URLSearchParams();
  for (const key of ['q','location','workplace','employmentType','industry']) { const value = params[key]; if (typeof value === 'string' && value) query.set(key, value); }
  let jobs: Job[] = []; let error = '';
  try { jobs = await api<Job[]>(`/jobs?${query}`); } catch { error = 'Jobs are temporarily unavailable. Please try again shortly.'; }
  return <main className="section page-bg"><div className="shell"><p className="kicker blue">Opportunities</p><h1>Find work that fits.</h1><form className="filters"><input name="q" aria-label="Keyword" defaultValue={typeof params.q === 'string' ? params.q : ''} placeholder="Title or keyword"/><input name="location" aria-label="Location" defaultValue={typeof params.location === 'string' ? params.location : ''} placeholder="City or state"/><select name="workplace" aria-label="Workplace" defaultValue={typeof params.workplace === 'string' ? params.workplace : ''}><option value="">All work styles</option><option>On-site</option><option>Hybrid</option><option>Remote</option></select><button className="btn navy">Search</button></form>{error && <p className="notice error">{error}</p>}<p className="result-count">{jobs.length} opportunity{jobs.length === 1 ? '' : 'ies'} found</p><div className="job-list">{jobs.map((job) => <article className="job-row" key={job.id}><div><div className="jobmeta"><span className="pill">{job.industry}</span><span className="pill">{job.employmentType}</span><span className="pill">{job.workplace}</span></div><h2>{job.title}</h2><p>{job.summary}</p><strong>{job.city}, {job.state}{job.compensation ? ` · ${job.compensation}` : ''}</strong></div><Link className="circle-link" href={`/jobs/${job.slug}`} aria-label={`View ${job.title}`}>→</Link></article>)}</div>{!jobs.length && !error && <div className="empty"><h2>No matching jobs</h2><p>Try removing a filter or join the talent network on our home page.</p></div>}</div></main>;
}
