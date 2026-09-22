import type { Metadata } from 'next';
import AdminPortal from '@/components/AdminPortal';

export const metadata: Metadata = { title: 'Administrator portal', robots: { index: false, follow: false } };
export default function AdminPage() { return <main className="admin-page"><AdminPortal/></main>; }
