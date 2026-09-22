import Link from 'next/link';
export default function NotFound() { return <main className="section page-bg"><div className="shell empty"><h1>Page not found</h1><p>The opportunity may have closed or the address may be incorrect.</p><Link className="btn navy" href="/jobs">View current jobs</Link></div></main>; }
