import Link from 'next/link';
import TalentNetworkForm from '@/components/TalentNetworkForm';

const industries = [
  {
    number: '01',
    title: 'Behavioral & Mental Health — Nursing',
    slug: 'behavioral-mental-health-nursing',
    jobIndustry: 'Behavioral Health',
    copy: 'Compassionate nursing and behavioral health professionals ready to support continuity of care.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=82',
  },
  {
    number: '02',
    title: 'Social and Community Services',
    slug: 'social-community-services',
    jobIndustry: 'Social Services',
    copy: 'Community-centered professionals who help individuals and families navigate critical services.',
    image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1200&q=82',
  },
  {
    number: '03',
    title: 'Education',
    slug: 'education',
    jobIndustry: 'Education',
    copy: 'Educators and student-support specialists who help learning communities thrive.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=82',
  },
  {
    number: '04',
    title: 'Residential Group Homes',
    slug: 'residential-group-homes',
    jobIndustry: 'Residential Services',
    copy: 'Dependable direct-care and residential support teams for safe, stable daily operations.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=82',
  },
  {
    number: '05',
    title: 'Addiction and Substance Abuse Services',
    slug: 'addiction-substance-abuse',
    jobIndustry: 'Addiction Services',
    copy: 'Credentialed recovery, counseling, intake, nursing, and after-care professionals.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=82',
  },
  {
    number: '06',
    title: 'Social Work',
    slug: 'social-work',
    jobIndustry: 'Social Work',
    copy: 'Mission-aligned social workers who bring sound judgment, empathy, and responsive support.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=82',
  },
];

export default function Home() {
  return (
    <main>
      <section className="demo-hero">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/s3-team-hero.png"
          aria-hidden="true"
        >
          <source
            src="https://videos.pexels.com/video-files/6997942/6997942-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="hero-shade" />
        <div className="shell hero-content">
          <p className="kicker light">Talent moves everything forward</p>
          <h1>Great people.<br /><em>Stronger communities.</em></h1>
          <p className="hero-copy">
            Superior Staffing Solutions connects skilled professionals with organizations where their work makes a meaningful difference.
          </p>
        </div>
        <div className="shell hero-values" aria-label="Our service commitments">
          <article>
            <span>01</span>
            <strong>People First</strong>
            <p>Every placement starts with listening, respect, and a clear understanding of the people involved.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Responsive</strong>
            <p>Qualified talent and attentive support when your team and the people you serve need it most.</p>
          </article>
          <article>
            <span>03</span>
            <strong>Specialized</strong>
            <p>Focused expertise across behavioral health, nursing, education, and essential human services.</p>
          </article>
        </div>
      </section>

      <section className="dual-path">
        <article className="path-card professional">
          <span className="giant-number">01</span>
          <div>
            <p className="kicker light">For Professionals</p>
            <h2>Work with purpose.</h2>
            <p className="path-subtitle">
              Find flexible opportunities aligned with your skills, goals, values, and schedule.
            </p>
            <div className="button-row">
              <Link className="button light-button" href="/jobs">Explore Opportunities</Link>
              <Link className="text-link light" href="#apply">Join our talent network →</Link>
            </div>
          </div>
        </article>
        <article className="path-card employer">
          <span className="giant-number">02</span>
          <div>
            <p className="kicker light">For Employers</p>
            <h2>Build the team you need.</h2>
            <p className="path-subtitle">
              From one critical opening to a complete onsite workforce, we deliver responsive staffing built around your organization.
            </p>
            <div className="button-row">
              <Link className="button green-button" href="/employers">Request Talent</Link>
              <Link className="button ghost-button" href="/solutions">Solution Services</Link>
            </div>
          </div>
        </article>
      </section>

      <section className="industries-section">
        <div className="shell">
          <div className="section-intro">
            <div>
              <p className="kicker green">Specialized Talent</p>
              <h2>Expertise where it matters.</h2>
            </div>
            <p>Focused recruiting for sectors where competence, compassion, and continuity directly influence outcomes.</p>
          </div>

          <div className="industry-grid">
            {industries.map((industry) => (
              <article
                className="industry-card"
                key={industry.slug}
                style={{ backgroundImage: `linear-gradient(180deg, rgba(2,18,13,.12), rgba(2,18,13,.94)), url("${industry.image}")` }}
              >
                <span className="card-number">{industry.number}</span>
                <div className="industry-card-content">
                  <h3>{industry.title}</h3>
                  <p>{industry.copy}</p>
                  <div className="industry-actions">
                    <Link href={`/solutions#${industry.slug}`}>Explore Field</Link>
                    <Link href={`/jobs?industry=${encodeURIComponent(industry.jobIndustry)}`}>Explore Opportunities</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="standard-section">
        <div className="standard-mark">
          <p className="kicker dark">Our Promise</p>
          <strong>3×</strong>
          <p>Listen deeply.<br />Move quickly.<br />Follow through.</p>
        </div>
        <div className="standard-copy">
          <p className="kicker green">More human by design</p>
          <h2>Superior staffing standards.</h2>
          <p>
            We built Superior Staffing Solutions around a simple belief: when professionals feel understood and employers feel supported, better matches happen.
          </p>
          <div className="check-grid">
            <span>✓ Dedicated support</span>
            <span>✓ Carefully matched talent</span>
            <span>✓ Clear communication</span>
            <span>✓ Flexible workforce solutions</span>
          </div>
          <Link className="button dark-button" href="/why-superior-staffing-solutions">Why Superior Staffing Solutions</Link>
        </div>
      </section>

      <section id="apply" className="apply-section">
        <div className="shell apply-grid">
          <div>
            <p className="kicker light">Let’s get started</p>
            <h2>Your next opportunity could start here.</h2>
            <p>Join the Superior Staffing Solutions talent network. Upload your résumé and tell us what kind of work you’re looking for.</p>
          </div>
          <TalentNetworkForm />
        </div>
      </section>
    </main>
  );
}

