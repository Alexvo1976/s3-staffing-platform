'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Notice } from './Notice';

export default function TalentNetworkForm() {
  const [state, setState] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setState(null);
    const form = event.currentTarget;
    try { await api('/talent-network', { method: 'POST', body: new FormData(form) }); form.reset(); setState({ type: 'success', message: 'Thank you. Your talent profile was received.' }); }
    catch (error) { setState({ type: 'error', message: error instanceof Error ? error.message : 'Unable to submit your profile.' }); }
    finally { setBusy(false); }
  }
  return <form className="network-form" onSubmit={submit}>
    <div className="two"><label>First name<input name="firstName" required /></label><label>Last name<input name="lastName" required /></label></div>
    <div className="two"><label>Email<input name="email" type="email" required /></label><label>Phone<input name="phone" type="tel" required /></label></div>
    <label>Roles you’re interested in<input name="preferredRoles" required placeholder="Nursing, operations, classroom support…" /></label>
    <div className="two"><label>Preferred area<input name="preferredArea" placeholder="City, state, or remote" /></label><label>Work preference<select name="workPreference"><option value="">Choose one</option><option>On-site</option><option>Hybrid</option><option>Remote</option><option>Flexible</option></select></label></div>
    <label>Résumé (PDF, DOC, or DOCX; maximum 5 MB)<input name="resume" type="file" accept=".pdf,.doc,.docx" required /></label>
    <label className="consent"><input name="consent" type="checkbox" value="true" required /><span>I consent to S3 storing this information and contacting me about employment opportunities.</span></label>
    <Notice state={state}/><button className="demo-btn" disabled={busy}>{busy ? 'Submitting…' : 'Join the talent network'} <span>→</span></button>
  </form>;
}
