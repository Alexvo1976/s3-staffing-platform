import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Learn about the experience, mission, and vision behind Superior Staffing Solutions.',
};

const differentiators = [
  {
    title: 'Quarter-Century Field Insight',
    text: 'Our talent strategies are shaped by leadership with more than 25 years of direct sector experience. We evaluate candidates through a practitioner’s lens.',
  },
  {
    title: 'Competence and Compassion',
    text: 'Credentials are our baseline. We also evaluate judgment, cultural awareness, trauma-informed readiness, communication, and mission alignment.',
  },
  {
    title: 'Rapid, Reliable Continuity',
    text: 'Coverage gaps strain teams and disrupt care. Our responsive placement process helps partners protect continuity of service.',
  },
  {
    title: 'A Dual Focus on Retention',
    text: 'Professional respect and dedicated support help placed talent stay engaged, strengthening retention and organizational stability.',
  },
];

export default function AboutPage() {
  return (
    <main className="page-bg">
      <section className="inner-hero story-hero">
        <div className="shell inner-hero-content">
          <p className="kicker light">Superior Staffing Solutions</p>
          <h1>Our Story</h1>
          <p>Built on experience. Driven by purpose. Centered on people.</p>
        </div>
      </section>

      <section className="story-section">
        <div className="shell story-grid">
          <div className="story-copy">
            <p className="kicker green">A personal commitment</p>
            <h2>Specialized understanding changes outcomes.</h2>
            <p>
              Superior Staffing Solutions was founded on a simple but powerful realization: in behavioral health, social services, nursing, and education, staffing is never merely about filling open shifts. Every placement can affect a life, a family, a classroom, and an entire community.
            </p>
            <p>
              After more than 25 years on the front lines and in leadership across human-service systems and educational institutions, our founder saw an enduring challenge: generalist recruiting models often miss the clinical demands, regulatory standards, and emotional resilience these fields require.
            </p>
            <p>
              Superior Staffing Solutions was created to bridge that divide. We speak the language of the organizations we serve, anticipate operational hurdles, and share their commitment to care and educational excellence.
            </p>
          </div>
          <figure className="story-photo tall-photo">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1400&q=84" alt="Experienced professional leading a thoughtful workplace conversation" />
          </figure>
        </div>

        <div className="shell purpose-grid">
          <article>
            <span>01</span>
            <p className="kicker green">Our Mission</p>
            <h2>Elevate care and education through exceptional talent.</h2>
            <p>We deliver mission-aligned professionals to the organizations that support and strengthen our communities.</p>
          </article>
          <article>
            <span>02</span>
            <p className="kicker green">Our Vision</p>
            <h2>Set the national standard for specialized staffing.</h2>
            <p>We aim to be renowned for clinical integrity, operational transparency, and transformative workforce solutions.</p>
          </article>
        </div>
      </section>

      <section className="story-band">
        <div className="shell story-band-grid">
          <figure className="story-photo wide-photo">
            <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1500&q=84" alt="Professionals collaborating around a table" />
          </figure>
          <div>
            <p className="kicker light">Why Superior Staffing Solutions</p>
            <h2>Experience translated into dependable service.</h2>
            <p>Our work combines field knowledge, attentive partnership, and disciplined recruiting for the people-centered sectors we know best.</p>
            <Link className="button light-button" href="/why-superior-staffing-solutions">See what sets us apart</Link>
          </div>
        </div>
      </section>

      <section className="differentiators-section">
        <div className="shell">
          <div className="section-heading">
            <p className="kicker green">What sets us apart</p>
            <h2>Knowledge, responsiveness, and respect.</h2>
          </div>
          <div className="differentiator-grid">
            {differentiators.map((item, index) => (
              <article key={item.title}>
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="center-action">
            <Link className="button dark-button" href="/specialized-staffing">Explore specialized staffing</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

