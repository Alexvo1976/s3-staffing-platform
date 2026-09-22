import { plainToInstance, Type } from 'class-transformer';

import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

class Environment {
  @IsIn(['development', 'test', 'production'])
  NODE_ENV = 'development';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  PORT = 4000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  WEB_ORIGIN = 'http://localhost:3000';

  @IsIn(['local', 'cognito'])
  AUTH_MODE = 'local';

  @IsOptional()
  @IsEmail()
  LOCAL_ADMIN_EMAIL?: string;

  @IsOptional()
  @IsString()
  LOCAL_ADMIN_PASSWORD?: string;

  @IsOptional()
  @IsString()
  JWT_SECRET?: string;

  @IsOptional()
  @IsString()
  COGNITO_USER_POOL_ID?: string;

  @IsOptional()
  @IsString()
  COGNITO_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  COGNITO_ISSUER?: string;

  @IsString()
  AWS_REGION = 'us-east-1';

  @IsString()
  S3_BUCKET!: string;

  @IsOptional()
  @IsString()
  S3_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  S3_FORCE_PATH_STYLE?: string;

  @IsIn(['s3'])
  STORAGE_DRIVER = 's3';

  @Type(() => Number)
  @IsInt()
  @Min(1024)
  MAX_RESUME_BYTES = 5_242_880;

  @IsIn(['smtp', 'ses'])
  EMAIL_DRIVER = 'smtp';

  @IsString()
  EMAIL_FROM!: string;

  @IsEmail()
  STAFF_NOTIFICATION_EMAIL!: string;

  @IsOptional()
  @IsString()
  SMTP_HOST?: string;

  @IsOptional()
  @IsString()
  SMTP_PORT?: string;

  @IsOptional()
  @IsString()
  SMTP_SECURE?: string;

  @IsOptional()
  @IsString()
  SQS_NOTIFICATION_QUEUE_URL?: string;
}

export function validateEnvironment(
  raw: Record<string, unknown>,
): Environment {
  const value = plainToInstance(
    Environment,
    raw,
    {
      enableImplicitConversion: true,
    },
  );

  const errors = validateSync(value, {
    skipMissingProperties: false,
  });

  if (errors.length) {
    throw new Error(
      `Invalid environment: ${errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .filter(Boolean)
        .join('; ')}`,
    );
  }

  if (
    value.AUTH_MODE === 'local' &&
    (
      !value.JWT_SECRET ||
      !value.LOCAL_ADMIN_EMAIL ||
      !value.LOCAL_ADMIN_PASSWORD
    )
  ) {
    throw new Error(
      'Local auth requires JWT_SECRET, LOCAL_ADMIN_EMAIL, and LOCAL_ADMIN_PASSWORD',
    );
  }

  if (
    value.AUTH_MODE === 'cognito' &&
    (
      !value.COGNITO_USER_POOL_ID ||
      !value.COGNITO_CLIENT_ID
    )
  ) {
    throw new Error(
      'Cognito auth requires COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID',
    );
  }

  return value;
}
