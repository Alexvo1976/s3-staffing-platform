import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Specialized Staffing',
  description:
    'Explore the six specialized sectors served by Superior Staffing Solutions.',
};

const sectors = [
  {
    number: '01',
    title: 'Behavioral & Mental Health — Nursing',
    id: 'behavioral-mental-health-nursing',
    copy: 'Clinical, nursing, counseling, behavioral, and care-management talent.',
  },
  {
    number: '02',
    title: 'Social and Community Services',
    id: 'social-community-services',
    copy: 'Professionals supporting families, communities, and essential programs.',
  },
  {
    number: '03',
    title: 'Education',
    id: 'education',
    copy: 'Educators, paraprofessionals, clinicians, and student-support specialists.',
  },
  {
    number: '04',
    title: 'Residential Group Homes',
    id: 'residential-group-homes',
    copy: 'Direct-care, residential, therapeutic, and nursing support professionals.',
  },
  {
    number: '05',
    title: 'Addiction and Substance Abuse Services',
    id: 'addiction-substance-abuse',
    copy: 'Recovery, treatment, counseling, residential, and clinical specialists.',
  },
  {
    number: '06',
    title: 'Social Work',
    id: 'social-work',
    copy: 'Licensed and degree-qualified social workers across care settings.',
  },
];

export default function SpecializedStaffingPage() {
  return (
    <main className="page-bg">
      <section className="inner-hero specialized-hero">
        <div className="shell inner-hero-content">
          <p className="kicker light">Specialized Staffing</p>
          <h1>Focused expertise for people-centered work.</h1>
          <p>Choose a sector to explore its core practices and skill sets.</p>
        </div>
      </section>

      <section className="sector-section">
        <div className="shell">
          <div className="sector-grid">
            {sectors.map((sector) => (
              <Link className="sector-card" href={`/solutions#${sector.id}`} key={sector.id}>
                <span>{sector.number}</span>
                <div>
                  <h2>{sector.title}</h2>
                  <p>{sector.copy}</p>
                  <strong>Explore skill sets →</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sector-cta">
        <div className="shell cta-row">
          <div>
            <p className="kicker light">Need a staffing partner?</p>
            <h2>Tell us what your team needs next.</h2>
          </div>
          <Link className="button light-button" href="/employers">Request Talent</Link>
        </div>
      </section>
    </main>
  );
}

