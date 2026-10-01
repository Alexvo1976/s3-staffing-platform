import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Solution Services',
  description:
    'Explore Superior Staffing Solutions core practices, specialized skill sets, and flexible staffing models.',
};

const practices = [
  {
    id: 'behavioral-mental-health-nursing',
    number: '01',
    title: 'Behavioral & Mental Health — Nursing',
    summary: 'Clinical and behavioral professionals prepared for settings where sound judgment, empathy, and continuity are essential.',
    roles: [
      'Mental Health Counselors',
      'Behavioral Analysts, Therapists & Assistants',
      'Case and Care Managers',
      'Psychiatrists and Psychologists',
      'Registered Nurses and Licensed Practical Nurses',
      'Certified Nursing and Medication Aides',
      'Phlebotomists and Clinical Support Professionals',
    ],
  },
  {
    id: 'social-community-services',
    number: '02',
    title: 'Social and Community Services',
    summary: 'Mission-aligned professionals who connect people with services, stability, and meaningful community support.',
    roles: [
      'Case and Care Managers',
      'Foster Care Workers',
      'Behavioral Health Specialists',
      'Child Welfare and Protection Specialists',
      'Counselors and Intake Specialists',
      'Discharge Planners',
      'Community Support Specialists',
    ],
  },
  {
    id: 'education',
    number: '03',
    title: 'Education',
    summary: 'Student-centered professionals supporting instruction, special education, health, behavior, and school operations.',
    roles: [
      'Special Education Teachers',
      'Early Childhood Teachers and Assistants',
      'Substitute Teachers',
      'Paraprofessionals',
      'School Nurses and One-to-One Care',
      'School Psychologists',
      'Behavioral Analysts and Therapists',
    ],
  },
  {
    id: 'residential-group-homes',
    number: '04',
    title: 'Residential Group Homes',
    summary: 'Reliable residential professionals who support safety, dignity, daily living, and consistent care.',
    roles: [
      'Residential Support Staff',
      'Mental Health Technicians',
      'Direct Care Staff',
      'Personal Care Assistants',
      'Therapeutic Support Staff',
      'Occupational Therapists',
      'Registered Nurses, Practical Nurses, and Nursing Assistants',
    ],
  },
  {
    id: 'addiction-substance-abuse',
    number: '05',
    title: 'Addiction and Substance Abuse Services',
    summary: 'Recovery-oriented talent for counseling, residential programs, treatment operations, nursing, intake, and after-care.',
    roles: [
      'Alcohol and Drug Counselors',
      'Substance Abuse Professionals',
      'Residential Counselors',
      'Intake and After-Care Specialists',
      'Detox and Methadone Treatment Nurses',
      'Social Workers and Family Therapists',
      'Psychiatrists and Psychologists',
    ],
  },
  {
    id: 'social-work',
    number: '06',
    title: 'Social Work',
    summary: 'Qualified social-work professionals for clinical, community, school, family, and care-coordination settings.',
    roles: [
      'Bachelor- and Master-Level Social Workers',
      'Licensed Clinical Social Workers',
      'School Social Workers',
      'Medical Social Workers',
      'Family and Child Welfare Specialists',
      'Care Coordinators',
      'Crisis and Community Outreach Professionals',
    ],
  },
];

const models = [
  {
    number: '01',
    title: 'Contract Staffing',
    text: 'Add qualified professionals for a defined assignment, urgent coverage need, seasonal workload, or program expansion while maintaining workforce flexibility.',
  },
  {
    number: '02',
    title: 'Contract-to-Hire',
    text: 'Evaluate skills, team alignment, reliability, and performance during a working assignment before making a long-term hiring decision.',
  },
  {
    number: '03',
    title: 'Direct Hire',
    text: 'Partner with our specialists to identify, assess, and recruit candidates for permanent roles that require lasting expertise and organizational fit.',
  },
  {
    number: '04',
    title: 'Onsite Staffing Services',
    text: 'Build and support a coordinated onsite workforce with recruiting, placement, communication, and service continuity organized around your operation.',
  },
];

export default function SolutionsPage() {
  return (
    <main className="page-bg">
      <section className="inner-hero solutions-hero">
        <div className="shell inner-hero-content">
          <p className="kicker light">Solution Services</p>
          <h1>Specialized people. Flexible workforce solutions.</h1>
          <p>Explore the practice knowledge and staffing models we bring to every partnership.</p>
        </div>
      </section>

      <section className="practice-section">
        <div className="shell">
          <div className="section-intro">
            <div>
              <p className="kicker green">Core practices and skill sets</p>
              <h2>Experience aligned to the work.</h2>
            </div>
            <p>Each practice is supported by recruiting focused on the credentials, responsibilities, and human qualities the setting demands.</p>
          </div>
          <div className="practice-list">
            {practices.map((practice) => (
              <article id={practice.id} className="practice-row" key={practice.id}>
                <div className="practice-title">
                  <span>{practice.number}</span>
                  <h3>{practice.title}</h3>
                  <p>{practice.summary}</p>
                </div>
                <ul>
                  {practice.roles.map((role) => <li key={role}>{role}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="staffing-models">
        <div className="shell">
          <div className="section-heading">
            <p className="kicker light">Staffing models</p>
            <h2>Choose the support your organization needs.</h2>
          </div>
          <div className="model-grid">
            {models.map((model) => (
              <article key={model.title}>
                <span>{model.number}</span>
                <h3>{model.title}</h3>
                <p>{model.text}</p>
              </article>
            ))}
          </div>
          <div className="center-action">
            <Link className="button light-button" href="/employers">Request Talent</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

