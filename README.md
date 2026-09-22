# Superior Staffing Solutions — Production Platform

Production-ready staffing platform for public job discovery, candidate applications, résumé uploads, employer requests, talent-network registration, and administrator workflows.

## Stack

- Next.js 16, React 19, and TypeScript
- NestJS 12 on Fastify and Node.js 24 LTS
- PostgreSQL with Prisma ORM; Amazon Aurora PostgreSQL Serverless v2 in AWS
- Amazon Cognito for production administrator authentication
- Private Amazon S3 storage for résumés
- Amazon SES for email and SQS for asynchronous notifications
- AWS Amplify Hosting for the web app and ECS Fargate for the API
- AWS CDK v2 for infrastructure

## Local setup

Install Node.js 24 LTS, Docker Desktop, npm, and Git. Then run:

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

Open:

- Website: http://localhost:3000
- API and Swagger: http://localhost:4000/api/docs
- Mailpit: http://localhost:8025
- MinIO console: http://localhost:9001 (`minioadmin` / `minioadmin`)

Local admin credentials are defined by `LOCAL_ADMIN_EMAIL` and `LOCAL_ADMIN_PASSWORD` in `.env`. Never use local authentication in production.

## Useful commands

```bash
npm run build
npm test
npm run db:studio
npm run db:seed
docker compose down
```

## AWS deployment

The detailed runbook is in `docs/AWS_DEPLOYMENT.md`. In summary:

1. Bootstrap and deploy the CDK stack in the production AWS account.
2. Let CDK build and publish the API image to the bootstrapped ECR asset repository.
3. Run Prisma migrations as a one-off ECS task before updating the service.
4. Connect the repository to Amplify Hosting and set the frontend environment variables.
5. Verify the SES domain and move SES out of sandbox.
6. Create administrators in Cognito, enable MFA, and configure the callback/logout URLs.
7. Configure DNS, WAF, alarms, backups, retention rules, and a restore test.

## Production gates

- Replace every example secret and use Secrets Manager only.
- Keep the résumé bucket private; downloads use short-lived signed URLs.
- Disable Cognito self-registration and require MFA for administrators.
- Complete privacy, retention, equal-opportunity, and accessibility review.
- Run dependency, container, infrastructure, and application security scans.
- Test database restore, résumé recovery, mail bounce/complaint handling, and rollback.
