#!/usr/bin/env node
import 'source-map-support/register.js';
import * as cdk from 'aws-cdk-lib';
import { S3StaffingStack } from '../lib/s3-staffing-stack.js';

const app = new cdk.App();
new S3StaffingStack(app, 'S3StaffingProduction', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1' },
  description: 'Superior Staffing Solutions production platform',
});
