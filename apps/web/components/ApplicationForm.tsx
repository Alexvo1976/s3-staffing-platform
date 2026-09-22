'use client';

import { FormEvent, useState } from 'react';

import { api } from '@/lib/api';
import { Notice } from './Notice';

export default function ApplicationForm({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const [state, setState] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [busy, setBusy] = useState(false);
  const [placementType, setPlacementType] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBusy(true);
    setState(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    data.set('jobId', jobId);
    data.set('positionAppliedFor', jobTitle);

    try {
      await api('/applications', {
        method: 'POST',
        body: data,
      });

      form.reset();
      setPlacementType('');

      setState({
        type: 'success',
        message: `Your application for ${jobTitle} was received.`,
      });
    } catch (error) {
      setState({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Application could not be submitted.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form panel" onSubmit={submit}>
      <h2>Employment Application</h2>

      {/* CONTACT & IDENTIFICATION */}
      <section>
        <h3>Contact & Identification</h3>

        <div className="two">
          <label>
            First Name
            <input
              name="firstName"
              type="text"
              required
            />
          </label>

          <label>
            Middle Name
            <input
              name="middleName"
              type="text"
            />
          </label>
        </div>

        <label>
          Last Name
          <input
            name="lastName"
            type="text"
            required
          />
        </label>

        <div className="two">
          <label>
            Direct Phone Number
            <input
              name="phone"
              type="tel"
              required
            />
          </label>

          <label>
            Email Address
            <input
              name="email"
              type="email"
              required
            />
          </label>
        </div>

        <h4>Current Address</h4>

        <label>
          Street Address
          <input
            name="streetAddress"
            type="text"
          />
        </label>

        <div className="two">
          <label>
            City
            <input
              name="city"
              type="text"
              required
            />
          </label>

          <label>
            State
            <input
              name="state"
              type="text"
              required
            />
          </label>
        </div>

        <label>
          ZIP Code
          <input
            name="zipCode"
            type="text"
            inputMode="numeric"
            required
          />
        </label>
      </section>

      {/* RESUME AND CREDENTIALS */}
      <section>
        <h3>Resume & Credentials Upload</h3>

        <label>
          Resume / CV
          <input
            name="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            required
          />
          <small>
            PDF, DOC, or DOCX.
          </small>
        </label>

        <label>
          Professional Licenses
          <input
            name="professionalLicenses"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple
          />
        </label>

        <label>
          Degree Verifications
          <input
            name="degreeVerifications"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple
          />
        </label>
      </section>

      {/* PROFESSIONAL QUALIFICATIONS */}
      <section>
        <h3>Professional Licensure & Certifications</h3>

        <label>
          Professional Licenses & Certifications
          <textarea
            name="licensesCertifications"
            rows={4}
            placeholder="List professional licenses, certifications, license numbers, issuing state, and expiration dates if applicable."
          />
        </label>

        <label>
          Highest Level of Completed Education
          <select
            name="highestEducation"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select education level
            </option>

            <option value="High School Diploma / GED">
              High School Diploma / GED
            </option>

            <option value="Associate Degree">
              Associate Degree
            </option>

            <option value="Bachelor's Degree">
              Bachelor&apos;s Degree
            </option>

            <option value="Master's Degree">
              Master&apos;s Degree
            </option>

            <option value="Doctorate / Terminal Degree">
              Doctorate / Terminal Degree
            </option>
          </select>
        </label>

        <label>
          Position Applied For
          <input
            name="positionAppliedFor"
            type="text"
            value={jobTitle}
            readOnly
          />
        </label>
      </section>

      {/* AVAILABILITY */}
      <section>
        <h3>Availability & Work Preferences</h3>

        <label>
          Preferred Placement Type
          <select
            name="placementType"
            required
            value={placementType}
            onChange={(event) =>
              setPlacementType(event.target.value)
            }
          >
            <option value="">
              Select placement type
            </option>

            <option value="Full-Time (Direct Hire)">
              Full-Time (Direct Hire)
            </option>

            <option value="Full-Time (Contract / Temp-to-Perm)">
              Full-Time (Contract / Temp-to-Perm)
            </option>

            <option value="Part-Time">
              Part-Time
            </option>
          </select>
        </label>

        {placementType === 'Part-Time' && (
          <label>
            Days and Times Available
            <textarea
              name="partTimeAvailability"
              rows={3}
              required
              placeholder="Example: Monday–Friday, 8:00 AM–1:00 PM"
            />
          </label>
        )}

        <label>
          Available Start Date
          <input
            name="availableStartDate"
            type="date"
            required
          />
        </label>
      </section>

      {/* COMPLIANCE */}
      <section>
        <h3>Compliance & Onboarding Readiness</h3>

        <fieldset>
          <legend>
            Are you willing and able to complete a state/federal
            fingerprint background check, drug screen, and TB
            clearance prior to placement?
          </legend>

          <label>
            <input
              name="backgroundClearance"
              type="radio"
              value="Yes"
              required
            />
            Yes
          </label>

          <label>
            <input
              name="backgroundClearance"
              type="radio"
              value="No"
            />
            No
          </label>
        </fieldset>

        <fieldset>
          <legend>
            Are you legally authorized to work in the United States
            without sponsorship?
          </legend>

          <label>
            <input
              name="workAuthorization"
              type="radio"
              value="Yes"
              required
            />
            Yes
          </label>

          <label>
            <input
              name="workAuthorization"
              type="radio"
              value="No"
            />
            No
          </label>
        </fieldset>

        <fieldset>
          <legend>
            Do you have reliable means of transportation?
          </legend>

          <label>
            <input
              name="reliableTransportation"
              type="radio"
              value="Yes"
              required
            />
            Yes
          </label>

          <label>
            <input
              name="reliableTransportation"
              type="radio"
              value="No"
            />
            No
          </label>
        </fieldset>
      </section>

      {/* CONSENT */}
      <label className="consent">
        <input
          name="consent"
          type="checkbox"
          value="true"
          required
        />

        <span>
          I consent to Superior Staffing Solutions collecting,
          processing, and storing the information and documents
          submitted with this application for employment and staffing
          purposes.
        </span>
      </label>

      <Notice state={state} />

      <button
        className="btn navy"
        type="submit"
        disabled={busy}
      >
        {busy ? 'Submitting…' : 'Submit Application'}
      </button>
    </form>
  );
}
