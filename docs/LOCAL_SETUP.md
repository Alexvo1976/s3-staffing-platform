# Local setup — step by step

## 1. Install prerequisites

- Docker Desktop
- Node.js 24 LTS
- Git
- npm 11 or later

Verify them:

```bash
node --version
npm --version
docker --version
docker compose version
```

## 2. Configure the application

From the repository root:

```bash
cp .env.example .env
npm install
```

The provided `.env` values are intentionally local-only. Do not reuse the password or JWT secret in AWS.

## 3. Start PostgreSQL, object storage, and email capture

```bash
docker compose up -d
docker compose ps
```

Wait until PostgreSQL and MinIO report `healthy`.

## 4. Create the schema and test data

```bash
npm run db:deploy
npm run db:seed
```

The seed creates 20 jobs, 32 applications, 12 employer requests, and one local administrator.

## 5. Start the website and API

```bash
npm run dev
```

Open:

- Public website: http://localhost:3000
- Jobs: http://localhost:3000/jobs
- Employer form: http://localhost:3000/employers
- Admin portal: http://localhost:3000/admin
- API documentation: http://localhost:4000/api/docs
- Mailpit inbox: http://localhost:8025
- MinIO console: http://localhost:9001

Local administrator:

```text
Email: admin@s3staffing.local
Password: ChangeMe-Local-Only-123!
```

## 6. Verify everything

```bash
npm test
npm run test:smoke
npm run test:e2e
npm run build
```

The first Playwright run may require:

```bash
npx playwright install chromium
```

## 7. Stop or reset

Stop without deleting data:

```bash
docker compose down
```

Delete local database and uploaded test files, then start clean:

```bash
docker compose down -v
docker compose up -d
npm run db:deploy
npm run db:seed
```
