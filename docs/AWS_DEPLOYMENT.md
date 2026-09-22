# AWS production deployment — complete runbook

The CDK stack provisions the production network, private Aurora PostgreSQL cluster, ECS/Fargate API, Application Load Balancer, WAF, Cognito administrator directory, S3 résumé bucket, SQS queue and dead-letter queue, SES domain identity, CloudWatch logs/alarms, SNS alerts, and Amplify Hosting application.

## 1. Prepare the AWS account

Install Docker, Node.js 24, AWS CLI v2, and AWS CDK. Configure an administrator deployment profile only for the initial deployment:

```bash
aws configure sso
aws sts get-caller-identity
npm install
```

Choose the production region. `us-east-1` is the default.

## 2. Prepare DNS

Use an existing Route 53 hosted zone. Domain registration is separate from this stack. Set these values in `infra/cdk/cdk.json`:

```json
{
  "context": {
    "domainName": "your-domain.com",
    "hostedZoneId": "Z1234567890",
    "repositoryUrl": "https://github.com/OWNER/REPOSITORY",
    "branchName": "main",
    "notificationEmail": "operations@your-domain.com"
  }
}
```

For S3 Staffing, enter the final domain only after Route 53 registration is active. Do not use the previously failed registration request as proof that the hosted zone exists.

## 3. Bootstrap CDK

```bash
export AWS_REGION=us-east-1
export CDK_DEFAULT_REGION=us-east-1
cd infra/cdk
npx cdk bootstrap aws://ACCOUNT_ID/us-east-1
npx cdk diff
npx cdk deploy --all --require-approval broadening
```

Docker builds the API image and CDK publishes it to the account’s CDK ECR asset repository automatically.

## 4. Run database migrations

After the first stack deployment, open the ECS service in AWS Console and run a one-off task using the API task definition. Override the container command with:

```text
npm exec prisma -- --schema=apps/api/prisma/schema.prisma migrate deploy
```

Run migrations before each release that changes `schema.prisma`. Do not run `prisma migrate dev` in production.

Optionally seed a staging environment with:

```text
node --import tsx apps/api/prisma/seed.ts
```

Do not seed production with demonstration candidates.

## 5. Connect Amplify Hosting

The stack creates the Amplify app and production branch. If the GitHub connection was not already authorized in the account:

1. Open AWS Amplify → the `s3-staffing-prod-web` app.
2. Choose **Connect branch**.
3. Authorize the AWS Amplify GitHub App.
4. Select the repository and `main` branch.
5. Confirm that Amplify uses the repository’s `amplify.yml`.
6. Start the first deployment.

CDK supplies the API URL, Cognito authority, client ID, callback URL, and logout URL as Amplify environment variables.

## 6. Configure Cognito administrators

Create each administrator individually—public sign-up is disabled:

```bash
aws cognito-idp admin-create-user --user-pool-id USER_POOL_ID --username admin@your-domain.com --user-attributes Name=email,Value=admin@your-domain.com Name=email_verified,Value=true
aws cognito-idp admin-add-user-to-group --user-pool-id USER_POOL_ID --username admin@your-domain.com --group-name Administrators
```

Administrators must enroll in authenticator-app MFA at first sign-in.

## 7. Finish SES configuration

1. Add the SES DKIM records shown by AWS to Route 53.
2. Add SPF and DMARC records for the sending domain.
3. Request SES production access.
4. Configure an SES configuration set and SNS destinations for deliveries, bounces, and complaints.
5. Keep transactional mail isolated from bulk marketing campaigns.

## 8. Validate production

```bash
SMOKE_API_URL=https://api.your-domain.com/api/v1 \
SMOKE_WEB_URL=https://www.your-domain.com \
npm run test:smoke

E2E_BASE_URL=https://www.your-domain.com npm run test:e2e
```

Confirm WAF, health checks, ECS task health, Aurora backups, S3 public-access blocks, Cognito MFA, SES reputation metrics, CloudWatch alarms, and the SNS email subscription.

## 9. Release and rollback

- Merge reviewed changes into `main`; Amplify deploys the frontend atomically.
- Deploy infrastructure/API changes using `npx cdk diff` followed by `npx cdk deploy`.
- Run database migrations before traffic depends on new columns.
- Roll back the ECS service to the prior task definition if the API release fails.
- Redeploy the prior Amplify build if the frontend fails.
- Database migrations must be backward-compatible; restore from snapshot only for disaster recovery.

## Expected production resources

- 1 VPC across two Availability Zones
- Public ALB subnets, private application subnets, and isolated database subnets
- 1 NAT gateway
- ECS cluster and autoscaled Fargate service
- Aurora PostgreSQL Serverless v2 writer and reader
- Private encrypted/versioned S3 résumé bucket
- Cognito user pool, client, domain, and Administrators group
- SES domain identity
- SQS notification queue and dead-letter queue
- AWS WAF managed common rules and IP rate limiting
- CloudWatch logs, alarms, SNS alerts, and VPC flow logs
- Amplify Hosting app, production branch, and optional custom domain
