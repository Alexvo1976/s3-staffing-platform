'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { api } from '@/lib/api';

type Dashboard = { publishedJobs: number; applications: number; newApplications: number; employers: number; talentProfiles: number };
type Application = { id: string; status: string; createdAt: string; resumeFileName: string; candidate: { firstName: string; lastName: string; email: string; phone: string }; job: { title: string } };
type AdminJob = { id: string; title: string; status: string; city: string; state: string; _count: { applications: number } };
type Employer = { id: string; companyName: string; contactName: string; email: string; rolesNeeded: string; headcount: number; status: string };

const localMode = process.env.NEXT_PUBLIC_AUTH_MODE !== 'cognito';

function cognitoManager() {
  if (typeof window === 'undefined') return null;
  return new UserManager({ authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY!, client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!, redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!, post_logout_redirect_uri: process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI!, response_type: 'code', scope: 'openid email profile', userStore: new WebStorageStateStore({ store: window.sessionStorage }) });
}

export default function AdminPortal() {
  const [token, setToken] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [tab, setTab] = useState<'overview' | 'applications' | 'jobs' | 'employers'>('overview');
  const [error, setError] = useState('');

  const load = useCallback(async (accessToken: string) => {
    const headers = { Authorization: `Bearer ${accessToken}` };
    try {
      const [summary, applicationRows, jobRows, employerRows] = await Promise.all([
        api<Dashboard>('/admin/dashboard', { headers }), api<Application[]>('/admin/applications', { headers }), api<AdminJob[]>('/admin/jobs', { headers }), api<Employer[]>('/admin/employer-requests', { headers }),
      ]);
      setDashboard(summary); setApplications(applicationRows); setJobs(jobRows); setEmployers(employerRows);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to load dashboard'); }
  }, []);

  useEffect(() => {
    if (localMode) { const saved = sessionStorage.getItem('s3-admin-token'); if (saved) { setToken(saved); void load(saved); } return; }
    const manager = cognitoManager(); if (!manager) return;
    const finish = async () => {
      try {
        const user = window.location.search.includes('code=') ? await manager.signinRedirectCallback() : await manager.getUser();
        if (user?.access_token) { setToken(user.access_token); await load(user.access_token); }
      } catch { setError('Cognito sign-in could not be completed.'); }
    }; void finish();
  }, [load]);

  async function localLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); const values = Object.fromEntries(new FormData(event.currentTarget));
    try { const result = await api<{ accessToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify(values) }); sessionStorage.setItem('s3-admin-token', result.accessToken); setToken(result.accessToken); await load(result.accessToken); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Sign-in failed'); }
  }

  async function signIn() { await cognitoManager()?.signinRedirect(); }
  async function signOut() { if (localMode) { sessionStorage.removeItem('s3-admin-token'); setToken(null); setDashboard(null); } else await cognitoManager()?.signoutRedirect(); }
  async function changeStatus(id: string, status: string) { if (!token) return; await api(`/admin/applications/${id}/status`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) }); await load(token); }
  async function openResume(id: string) { if (!token) return; const result = await api<{ url: string }>(`/admin/applications/${id}/resume`, { headers: { Authorization: `Bearer ${token}` } }); window.open(result.url, '_blank', 'noopener,noreferrer'); }
  async function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return; setError(''); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form));
    const payload = { ...values, featured: values.featured === 'true', responsibilities: String(values.responsibilities).split('\n').map((value) => value.trim()).filter(Boolean), qualifications: String(values.qualifications).split('\n').map((value) => value.trim()).filter(Boolean) };
    try { await api('/admin/jobs', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }); form.reset(); await load(token); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to create job'); }
  }

  if (!token) return <div className="admin-login panel"><h1>Administrator portal</h1><p>Authorized S3 team members only.</p>{localMode ? <form className="form" onSubmit={localLogin}><label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" required /></label><button className="btn navy">Sign in</button></form> : <button className="btn navy" onClick={signIn}>Continue with S3 identity</button>}{error && <p className="notice error">{error}</p>}</div>;

  return <div className="admin-shell"><aside className="admin-nav"><h2>S³ Admin</h2>{(['overview','applications','jobs','employers'] as const).map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}<button onClick={signOut}>Sign out</button></aside><div className="admin-content">
    {error && <p className="notice error">{error}</p>}
    {tab === 'overview' && <><h1>Operations overview</h1><div className="metric-grid">{dashboard && Object.entries(dashboard).map(([key,value]) => <article className="metric" key={key}><strong>{value}</strong><span>{key.replace(/([A-Z])/g, ' $1')}</span></article>)}</div></>}
    {tab === 'applications' && <><h1>Applications</h1><div className="table-wrap"><table><thead><tr><th>Candidate</th><th>Job</th><th>Status</th><th>Submitted</th><th>Résumé</th></tr></thead><tbody>{applications.map((row) => <tr key={row.id}><td><strong>{row.candidate.firstName} {row.candidate.lastName}</strong><br/><small>{row.candidate.email}</small></td><td>{row.job.title}</td><td><select value={row.status} onChange={(e) => void changeStatus(row.id, e.target.value)}>{['NEW','REVIEWING','INTERVIEW','OFFER','HIRED','REJECTED'].map((status) => <option key={status}>{status}</option>)}</select></td><td>{new Date(row.createdAt).toLocaleDateString()}</td><td><button className="link-button" onClick={() => void openResume(row.id)}>Open</button></td></tr>)}</tbody></table></div></>}
    {tab === 'jobs' && <><h1>Job management</h1><form className="form panel admin-job-form" onSubmit={createJob}><h2>Publish a job</h2><div className="two"><label>Title<input name="title" required minLength={3}/></label><label>Industry<select name="industry" required><option>Healthcare</option><option>Education</option><option>Behavioral Health</option><option>Business Support</option></select></label></div><label>Summary<input name="summary" required minLength={20}/></label><label>Description<textarea name="description" required minLength={50}/></label><div className="two"><label>Responsibilities, one per line<textarea name="responsibilities" required/></label><label>Qualifications, one per line<textarea name="qualifications" required/></label></div><div className="two"><label>City<input name="city" required/></label><label>State<input name="state" required/></label></div><div className="two"><label>Workplace<select name="workplace"><option>On-site</option><option>Hybrid</option><option>Remote</option></select></label><label>Employment type<select name="employmentType"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Temporary</option></select></label></div><div className="two"><label>Compensation<input name="compensation"/></label><label>Status<select name="status"><option>PUBLISHED</option><option>DRAFT</option></select></label></div><label className="consent"><input type="checkbox" name="featured" value="true"/><span>Feature this job</span></label><button className="btn navy">Create job</button></form><div className="table-wrap"><table><thead><tr><th>Title</th><th>Location</th><th>Status</th><th>Applications</th></tr></thead><tbody>{jobs.map((job) => <tr key={job.id}><td>{job.title}</td><td>{job.city}, {job.state}</td><td>{job.status}</td><td>{job._count.applications}</td></tr>)}</tbody></table></div></>}
    {tab === 'employers' && <><h1>Employer requests</h1><div className="table-wrap"><table><thead><tr><th>Company</th><th>Contact</th><th>Need</th><th>Status</th></tr></thead><tbody>{employers.map((row) => <tr key={row.id}><td>{row.companyName}</td><td>{row.contactName}<br/><small>{row.email}</small></td><td>{row.headcount} × {row.rolesNeeded}</td><td>{row.status}</td></tr>)}</tbody></table></div></>}
  </div></div>;
}
