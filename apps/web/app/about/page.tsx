import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story | Superior Staffing Solutions',
  description:
    'Learn about Superior Staffing Solutions, our mission, vision, experience, and specialized staffing practice areas.',
};

const practiceAreas = [
  {
    title: 'Behavioral & Mental Health',
    roles: [
      'Mental Health Counselors',
      'Social Workers (BSW, MSW, LCSW, LICSW, LCSW-C)',
      'Behavioral Analysts, Therapists & Assistants (BCBA, BCaBA, ABA)',
      'Case & Care Managers',
      'Drug & Alcohol Counselors',
      'Licensed Marriage & Family',
      'Therapists (LMFT)',
      'Licensed Professional',
      'Counselors (LPC)',
      'Mobile Therapists',
      'Psychiatrists',
      'Psychologists',
      'Triage Consultants',
      'Registered Nurses (RN)',
      'Licensed Practical Nurses (LPN)',
      'Licensed Vocational Nurses (LVN)',
      'Certified Nurse Aide (CNA)',
      'Geriatric Nurse Aide (GNA)',
      'Certified Medication Aides',
      'Phlebotomists',
    ],
  },
  {
    title: 'Social & Community Services',
    roles: [
      'Social Workers (BSW, MSW)',
      'Licensed Social Workers (LCSW, LICSW, LCSW-C)',
      'Case Managers',
      'Care Managers',
      'Foster Care Workers',
      'Behavioral Health Specialists',
      'Child Welfare/Protection Specialists',
      'Counselors',
      'Intake Specialists',
      'Discharge Planners',
    ],
  },
  {
    title: 'Specialized Education',
    roles: [
      'Paraprofessionals: Early Childhood and Special Education',
      'Special Education Teachers',
      'Early Childhood Teachers/Assistants',
      'Substitute Teachers',
      'Teachers: PK-12, Alternative Education, Home Instruction, and Head Start',
      'Nurses: Clinic, Escort and 1:1 Care',
      'Psychologists',
      'Behavioral Analysts & Therapists (BCBA, BCBA, ABA)',
    ],
  },
  {
    title: 'Residential Group Homes',
    roles: [
      'Child Study Teams',
      'Support Staff: bus aides/monitors, cafeteria workers, and clerical staff (through an affiliate)',
      'Educational Diagnosticians',
      'Learning Disabilities’ Teacher-Consultants (LDT-C)',
      'Counselors and Social Workers',
      'Residential Staff Supports',
      'Mental Health Technicians',
      'Direct Care Staff',
      'Personal Care Assistants (PCA)',
      'Therapeutic Staff Supports',
      'Occupational Therapists (OT)',
      'Certified Nursing Assistants (CNA)',
      'Registered Nurses (RN)',
      'Licensed Practical Nurses (LPN)',
    ],
  },
  {
    title: 'Addictions & Substance Abuse Services',
    roles: [
      'Alcohol and Drug Abuse Counselors',
      'Alcohol and Drug Therapists',
      'Psychiatrists',
      'Licensed or Certified Psychologists',
      'Licensed or Certified Social Workers',
      'Licensed or Certified Employee Assistance Professionals',
      'Licensed or Certified Marriage and Family Therapists (MFT, LMFT)',
      'Substance Abuse Professionals',
      'Residential Counselors',
      'Social Workers',
      'Intake and After Care Specialists',
      'Registered Nurses (RN)',
      'Licensed Practical Nurses (LPN)',
      'Licensed Vocational Nurses (LVN)',
      'Certified Nurse Aide (CNA)',
      'Geriatric Nurse Aide (GNA)',
      'Certified Medication Aides',
      'Phlebotomists',
      'Detox Nurses',
      'Methadone Treatment Nurses',
    ],
  },
];

const differentiators = [
  {
    title: 'Quarter-Century Field Insight',
    text: 'Our talent acquisition strategies are designed by leadership with over 25 years of direct sector experience. We evaluate candidates through a practitioner’s lens, not a sales quota.',
  },
  {
    title: 'Vetted for Competence and Compassion',
    text: 'Technical qualifications and active credentials are our baseline. We go further by evaluating clinical judgment, cultural competence, trauma-informed readiness, and mission alignment.',
  },
  {
    title: 'Rapid, Reliable Continuity',
    text: 'In human services and schools, gaps in coverage strain remaining staff and disrupt client care. We provide responsive, compliant, and seamless placement solutions that preserve continuity of service.',
  },
  {
    title: 'Dual Focus on Retention',
    text: 'By providing dedicated support and professional respect to our placed talent, we ensure higher engagement, lower turnover, and lasting stability for our partner organizations.',
  },
];

export default function AboutPage() {
  return (
    <main className="page-bg">
      <section className="section">
        <div className="shell">
          <div className="prose">
            <p className="kicker blue">Superior Staffing Solutions</p>

            <h1>Our Story</h1>

            <h2>Built on Experience. Driven by Purpose.</h2>

            <p>
              <strong>Superior Staffing Solutions</strong> was founded on a
              simple yet profound realization: specialized fields require
              specialized understanding. In behavioral health, social services,
              and education, staffing is never merely about filling open
              shifts; it directly impacts human lives, community well-being,
              and developmental outcomes.
            </p>

            <p>
              After more than 25 years on the front lines and in leadership
              across behavioral health systems, social service agencies, and
              educational institutions, our founder recognized an enduring
              industry challenge: traditional staffing agencies often fail to
              grasp the nuanced clinical demands, regulatory standards, and
              emotional resilience required in these critical sectors.
            </p>

            <p>
              Superior Staffing Solutions was established to bridge that
              divide. We are not generalist recruiters; we are industry
              veterans who speak your language, anticipate your operational
              hurdles, and share your commitment to care and educational
              excellence.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="prose">
            <p className="kicker blue">Why S3</p>
            <h2>What Sets Us Apart</h2>

            <div>
              {differentiators.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="prose">
            <p className="kicker blue">Specialized Staffing</p>
            <h2>Our Core Practice Areas</h2>

            {practiceAreas.map((area) => (
              <section key={area.title}>
                <h3>{area.title}</h3>

                <ul>
                  {area.roles.map((role, index) => (
                    <li key={`${area.title}-${index}`}>{role}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="prose">
            <p className="kicker blue">Our Purpose</p>

            <h2>Our Mission</h2>

            <p>
              To elevate the standard of care and education by delivering
              exceptional, mission-aligned talent to the organizations that
              support and strengthen our communities.
            </p>

            <h2>Our Vision</h2>

            <p>
              To be the nation’s premier staffing partner for human services
              and education—renowned for uncompromising clinical integrity,
              operational transparency, and transformative workforce
              solutions.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
