# Testing guide

## Automated coverage included

- API unit tests for job filtering, publishing behavior, and unsafe résumé rejection
- React component tests for accessible success/error feedback
- Playwright browser tests for the home page, job search/detail journey, responsive rendering, and employer validation
- A smoke test for the deployed API, job data, and public website
- TypeScript compilation for the API, web app, and AWS infrastructure

## Commands

```bash
npm test
npm run lint
npm run build
npm run test:e2e
npm run test:smoke
```

## Production acceptance checklist

1. Submit PDF, DOC, and DOCX résumés and confirm each remains private.
2. Confirm an executable or file over 5 MB is rejected.
3. Confirm candidate and staff messages arrive through SES.
4. Confirm SES bounce and complaint notifications are monitored.
5. Create, publish, close, and search for a job.
6. Move an application through every workflow status.
7. Verify Cognito MFA, password reset, sign-out, and expired-token behavior.
8. Run accessibility checks for keyboard navigation, focus order, form labels, and color contrast.
9. Load test public search and submission endpoints.
10. Restore Aurora from a snapshot into a test environment and confirm the application can read it.
