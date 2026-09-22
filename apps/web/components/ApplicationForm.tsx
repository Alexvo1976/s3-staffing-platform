'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Notice } from './Notice';

export default function ApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [state, setState] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setState(null); const form = event.currentTarget;
    try { const data = new FormData(form); data.set('jobId', jobId); await api('/applications', { method: 'POST', body: data }); form.reset(); setState({ type: 'success', message: `Your application for ${jobTitle} was received.` }); }
    catch (error) { setState({ type: 'error', message: error instanceof Error ? error.message : 'Application could not be submitted.' }); }
    finally { setBusy(false); }
  }
  return <form className="form panel" onSubmit={submit}>
    <h2>Apply for this role</h2>
    <div className="two"><label>First name<input name="firstName" required /></label><label>Last name<input name="lastName" required /></label></div>
    <div className="two"><label>Email<input name="email" type="email" required /></label><label>Phone<input name="phone" type="tel" required /></label></div>
    <div className="two"><label>City<input name="city" /></label><label>State<input name="state" /></label></div>
    <div className="two"><label>LinkedIn URL<input name="linkedInUrl" type="url" /></label><label>Years of experience<input name="yearsExp" type="number" min="0" max="60" /></label></div>
    <label>Skills<input name="skills" placeholder="Separate skills with commas" /></label>
    <label>Short cover note<textarea name="coverLetter" /></label>
    <label>Résumé (PDF, DOC, or DOCX; maximum 5 MB)<input name="resume" type="file" accept=".pdf,.doc,.docx" required /></label>
    <label className="consent"><input name="consent" type="checkbox" value="true" required /><span>I consent to S3 processing my application and storing my résumé.</span></label>
    <Notice state={state}/><button className="btn navy" disabled={busy}>{busy ? 'Submitting…' : 'Submit application'}</button>
  </form>;
}
