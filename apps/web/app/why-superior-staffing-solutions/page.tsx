import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Why Superior Staffing Solutions',
  description:
    'See how field experience, specialized recruiting, and responsive partnership distinguish Superior Staffing Solutions.',
};

const reasons = [
  ['01', 'Field-informed recruiting', 'We understand the work behind the job description, helping us recognize the credentials, judgment, and interpersonal skills each setting requires.'],
  ['02', 'Thoughtful matching', 'We look beyond availability to align experience, schedule, environment, mission, and expectations for both professionals and employers.'],
  ['03', 'Responsive partnership', 'Clear communication and timely follow-through keep hiring teams informed and professionals supported from first conversation through placement.'],
  ['04', 'Continuity that matters', 'Reliable staffing protects teams, programs, classrooms, residents, patients, and communities from avoidable disruption.'],
];

export default function WhyPage() {
  return (
    <main className="page-bg">
      <section className="inner-hero why-hero">
        <div className="shell inner-hero-content">
          <p className="kicker light">Our difference</p>
          <h1>Why Superior Staffing Solutions</h1>
          <p>A people-first staffing partner grounded in experience, integrity, and specialized understanding.</p>
        </div>
      </section>

      <section className="why-section">
        <div className="shell why-layout">
          <div className="why-lead">
            <p className="kicker green">Built for essential fields</p>
            <h2>Staffing should strengthen the work—not add friction to it.</h2>
            <p>Our approach brings disciplined recruiting and genuine human attention together, creating a more dependable experience for every partner and professional.</p>
            <Link className="button dark-button" href="/employers">Start a conversation</Link>
          </div>
          <div className="why-list">
            {reasons.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

