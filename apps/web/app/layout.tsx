import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Superior Staffing Solutions',
    template: '%s | Superior Staffing Solutions',
  },
  description:
    'People-first staffing for behavioral health, nursing, education, social services, residential programs, and community care.',
};

const navigation = [
  ['Our Story', '/about'],
  ['Specialized Staffing', '/specialized-staffing'],
  ['Solution Services', '/solutions'],
  ['Why Us', '/why-superior-staffing-solutions'],
] as const;

function NavigationLinks() {
  return (
    <>
      <Link href="/">Home</Link>
      {navigation.map(([label, href]) => (
        <Link href={href} key={href}>{label}</Link>
      ))}
    </>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <nav className="shell nav" aria-label="Primary navigation">
            <Link className="brand brand-logo" href="/" aria-label="Superior Staffing Solutions home">
              <Image
                src="/images/s3-logo.png"
                alt="Superior Staffing Solutions"
                width={430}
                height={245}
                priority
              />
            </Link>

            <div className="desktop-navigation">
              <div className="links"><NavigationLinks /></div>
              <div className="nav-actions">
                <Link className="nav-tab nav-tab-outline" href="/jobs">Explore Opportunities</Link>
                <Link className="nav-tab nav-tab-solid" href="/employers">Request Talent</Link>
              </div>
            </div>

            <details className="mobile-navigation">
              <summary aria-label="Open navigation">Menu</summary>
              <div className="mobile-menu">
                <NavigationLinks />
                <Link className="nav-tab nav-tab-outline" href="/jobs">Explore Opportunities</Link>
                <Link className="nav-tab nav-tab-solid" href="/employers">Request Talent</Link>
              </div>
            </details>
          </nav>
        </header>

        {children}

        <footer className="footer">
          <div className="shell">
            <div className="footer-grid">
              <div>
                <Link className="footer-logo" href="/" aria-label="Superior Staffing Solutions home">
                  <Image src="/images/s3-logo.png" alt="Superior Staffing Solutions" width={500} height={285} />
                </Link>
                <p className="footer-tagline">Better matches. Stronger outcomes.</p>
              </div>
              <div className="footer-contact">
                <h2>Contact</h2>
                <p>
                  <strong>Superior Staffing Solutions</strong><br />
                  One Westbrook Corporate Center<br />
                  Suite 300<br />
                  Westchester, Illinois 60154
                </p>
                <p>
                  <strong>Email</strong><br />
                  <a href="mailto:Superior-staffing@outlook.com">Superior-staffing@outlook.com</a>
                </p>
                <p>
                  <strong>Cell</strong><br />
                  <a href="tel:+17083698511">708-369-8511</a>
                </p>
              </div>
            </div>

            <div className="footer-links">
              <Link href="/about">Our Story</Link>
              <Link href="/specialized-staffing">Specialized Staffing</Link>
              <Link href="/solutions">Solution Services</Link>
              <Link href="/jobs">Opportunities</Link>
              <Link href="/employers">Request Talent</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/admin">Admin</Link>
            </div>

            <p className="copyright">
              © {new Date().getFullYear()} Superior Staffing Solutions. Equal Opportunity Employer.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

