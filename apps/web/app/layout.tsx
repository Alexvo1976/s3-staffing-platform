import type { Metadata } from 'next';
import Link from 'next/link';


import Image from 'next/image';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Superior Staffing Solutions',
    template: '%s | S3 Staffing',
  },
  description:
    'People-first staffing for healthcare, education, behavioral health, social services, and specialized workforce solutions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <nav
            className="shell nav"
            aria-label="Primary navigation"
          >
            <Link
              className="brand brand-logo"
              href="/"
              aria-label="Superior Staffing Solutions home"
            >
              <Image
                src="/images/s3-logo.png"
                alt="Superior Staffing Solutions"
                width={332}
                height={189}
                priority
              />
            </Link>

            <div className="links">
              <Link href="/">Home</Link>

              <Link href="/about">
                Our Story
              </Link>

              <Link href="/jobs">
                Jobs
              </Link>

              <Link href="/#industries">
                Industries
              </Link>

              <Link href="/employers">
                Employers
              </Link>

              <Link
                className="demo-btn small"
                href="/jobs"
              >
                Find opportunities <span>↗</span>
              </Link>
            </div>
          </nav>
        </header>

        {children}

        <footer className="footer">
          <div className="shell">
            <div className="footer-main">
              <Link
              className="brand brand-logo"
              href="/"
              aria-label="Superior Staffing Solutions home"
            >
              <Image
                src="/images/s3-logo.png"
                alt="Superior Staffing Solutions"
                width={332}
                height={189}
                priority
              />
            </Link>

              <p>
                Better matches.
                <br />
                Stronger outcomes.
              </p>
            </div>

            <div className="footer-links">
              <Link href="/about">
                Our Story
              </Link>

              <Link href="/jobs">
                Jobs
              </Link>

              <Link href="/employers">
                Employers
              </Link>

              <Link href="/privacy">
                Privacy
              </Link>

              <Link href="/admin">
                Admin
              </Link>
            </div>

            <p className="copyright">
              © {new Date().getFullYear()} Superior Staffing Solutions.
              Equal Opportunity Employer.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
