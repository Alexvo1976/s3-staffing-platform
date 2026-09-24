import { spawn } from 'node:child_process';

function ensureDatabaseUrl() {
  if (process.env.DATABASE_URL) return;

  const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT = '5432',
    DB_NAME = 's3staffing',
  } = process.env;

  if (!DB_USER || !DB_PASSWORD || !DB_HOST) {
    throw new Error(
      'Database configuration is incomplete: DB_USER, DB_PASSWORD, and DB_HOST are required',
    );
  }

  process.env.DATABASE_URL =
    `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}` +
    `@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public&sslmode=require`;
}

ensureDatabaseUrl();

const migration = spawn(
  process.execPath,
  [
    'node_modules/prisma/build/index.js',
    'migrate',
    'deploy',
    '--schema',
    'apps/api/prisma/schema.prisma',
  ],
  {
    cwd: '/app',
    env: process.env,
    stdio: 'inherit',
  },
);

const exitCode = await new Promise((resolve, reject) => {
  migration.once('error', reject);
  migration.once('exit', (code, signal) => {
    if (signal) {
      reject(new Error(`Prisma migration terminated by signal ${signal}`));
      return;
    }
    resolve(code ?? 1);
  });
});

if (exitCode !== 0) {
  process.exit(exitCode);
}
