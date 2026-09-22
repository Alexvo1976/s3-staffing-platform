import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = { title: { default: 'Superior Staffing Solutions', template: '%s | S3 Staffing' }, description: 'People-first staffing for healthcare, education, behavioral health, and business support.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header className="topbar"><nav className="shell nav" aria-label="Primary navigation">
      <Link className="brand" href="/"><span className="brand-box">S<sup>3</sup></span><span>Superior Staffing<br/>Solutions</span></Link>
      <div className="links"><Link href="/jobs">Jobs</Link><Link href="/#industries">Industries</Link><Link href="/#about">About</Link><Link href="/employers">Employers</Link><Link className="demo-btn small" href="/jobs">Find opportunities <span>↗</span></Link></div>
    </nav></header>
    {children}
    <footer className="footer"><div className="shell"><div className="footer-main"><Link className="brand" href="/"><span className="brand-box">S<sup>3</sup></span><span>Superior Staffing<br/>Solutions</span></Link><p>Better matches.<br/>Stronger outcomes.</p></div><div className="footer-links"><Link href="/jobs">Jobs</Link><Link href="/employers">Employers</Link><Link href="/privacy">Privacy</Link><Link href="/admin">Admin</Link></div><p className="copyright">© {new Date().getFullYear()} Superior Staffing Solutions. Equal Opportunity Employer.</p></div></footer>
  </body></html>;
}
