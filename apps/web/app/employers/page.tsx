import type { Metadata } from 'next';
import EmployerForm from '@/components/EmployerForm';

export const metadata: Metadata = { title: 'Request talent' };
export default function EmployersPage() { return <main className="section page-bg"><div className="shell employer-layout"><div><p className="kicker blue">For employers</p><h1>Build the team you need.</h1><p className="lead">Tell us what success looks like. Our team will learn your priorities, identify qualified professionals, and stay engaged throughout the placement.</p><div className="step-list"><div><strong>01</strong><span><b>Tell us the need</b><small>Role, schedule, timing, and team environment.</small></span></div><div><strong>02</strong><span><b>Meet matched talent</b><small>Carefully reviewed people aligned to the work.</small></span></div><div><strong>03</strong><span><b>Move forward confidently</b><small>Responsive support from selection through start.</small></span></div></div></div><EmployerForm/></div></main>; }
