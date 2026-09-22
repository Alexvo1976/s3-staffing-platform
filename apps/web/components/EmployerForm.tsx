'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Notice } from './Notice';

export default function EmployerForm() {
  const [state, setState] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setState(null); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form));
    try { await api('/employer-requests', { method: 'POST', body: JSON.stringify({ ...values, headcount: Number(values.headcount) }) }); form.reset(); setState({ type: 'success', message: 'Your staffing request was received. Our team will contact you shortly.' }); }
    catch (error) { setState({ type: 'error', message: error instanceof Error ? error.message : 'Unable to submit request.' }); }
    finally { setBusy(false); }
  }
  return <form className="form panel employer-form" onSubmit={submit}>
    <div className="two"><label>Company<input name="companyName" required /></label><label>Your name<input name="contactName" required /></label></div>
    <div className="two"><label>Business email<input name="email" type="email" required /></label><label>Phone<input name="phone" type="tel" required /></label></div>
    <div className="two"><label>Industry<select name="industry" required><option value="">Choose one</option><option>Healthcare</option><option>Education</option><option>Behavioral Health</option><option>Business Support</option><option>Other</option></select></label><label>People needed<input name="headcount" type="number" min="1" max="1000" defaultValue="1" required /></label></div>
    <label>Roles needed<input name="rolesNeeded" required placeholder="Registered nurses, coordinators…" /></label>
    <div className="two"><label>When do you need them?<select name="startTimeline" required><option>Immediately</option><option>Within 30 days</option><option>Within 60 days</option><option>Planning ahead</option></select></label><label>Engagement type<select name="engagementType" required><option>Temporary</option><option>Contract</option><option>Contract-to-hire</option><option>Direct hire</option><option>Not sure</option></select></label></div>
    <label>Additional details<textarea name="additionalDetail" /></label>
    <Notice state={state}/><button className="btn navy" disabled={busy}>{busy ? 'Sending…' : 'Request talent'}</button>
  </form>;
}
