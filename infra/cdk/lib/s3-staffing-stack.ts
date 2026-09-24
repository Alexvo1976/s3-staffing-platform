import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cdk from 'aws-cdk-lib';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export class S3StaffingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const project = this.node.tryGetContext('projectName') ?? 's3-staffing';
    const environment = this.node.tryGetContext('environment') ?? 'prod';
    const prefix = `${project}-${environment}`;
    const domainName = String(this.node.tryGetContext('domainName') ?? '');
    const hostedZoneId = String(this.node.tryGetContext('hostedZoneId') ?? '');
    const repositoryUrl = String(this.node.tryGetContext('repositoryUrl') ?? '');
    const branchName = String(this.node.tryGetContext('branchName') ?? 'main');
    const notificationEmail = String(this.node.tryGetContext('notificationEmail') ?? '');
    const desiredCount = Number(this.node.tryGetContext('apiDesiredCount') ?? 1);
    const customDomain = Boolean(domainName && hostedZoneId);
    const protectData = String(this.node.tryGetContext('protectData') ?? 'true') !== 'false';

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'application', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
        { name: 'database', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
    });

    const vpcFlowLogGroup = new logs.LogGroup(this, 'VpcFlowLogGroup', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const vpcFlowLogRole = new iam.Role(this, 'VpcFlowLogRole', {
      assumedBy: new iam.ServicePrincipal('vpc-flow-logs.amazonaws.com', {
        conditions: {
          StringEquals: { 'aws:SourceAccount': this.account },
          ArnLike: {
            'aws:SourceArn': `arn:${cdk.Aws.PARTITION}:ec2:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:vpc-flow-log/*`,
          },
        },
      }),
      inlinePolicies: {
        FlowLogDelivery: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
                'logs:DescribeLogGroups',
                'logs:DescribeLogStreams',
              ],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    vpc.addFlowLog('FlowLogs', {
      destination: ec2.FlowLogDestination.toCloudWatchLogs(
        vpcFlowLogGroup,
        vpcFlowLogRole,
      ),
    });

    const database = new rds.DatabaseCluster(this, 'Database', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.of('16.14', '16'),
      }),
      writer: rds.ClusterInstance.serverlessV2('writer'),
      readers: [rds.ClusterInstance.serverlessV2('reader', { scaleWithWriter: true })],
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 4,
      credentials: rds.Credentials.fromGeneratedSecret('s3admin'),
      defaultDatabaseName: 's3staffing',
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      storageEncrypted: true,
      backup: {
        retention: cdk.Duration.days(14),
        preferredWindow: '05:00-06:00',
      },
      cloudwatchLogsExports: ['postgresql'],
      cloudwatchLogsRetention: logs.RetentionDays.ONE_MONTH,
      deletionProtection: protectData,
      removalPolicy: protectData
        ? cdk.RemovalPolicy.SNAPSHOT
        : cdk.RemovalPolicy.DESTROY,
    });

    const resumes = new s3.Bucket(this, 'Resumes', {
      bucketName: `${prefix}-resumes-${this.account}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      lifecycleRules: [{
        id: 'retain-active-resumes',
        enabled: true,
        transitions: [{
          storageClass: s3.StorageClass.INTELLIGENT_TIERING,
          transitionAfter: cdk.Duration.days(30),
        }],
        noncurrentVersionExpiration: cdk.Duration.days(90),
      }],
      removalPolicy: protectData
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    const deadLetterQueue = new sqs.Queue(this, 'NotificationDlq', {
      queueName: `${prefix}-notifications-dlq`,
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      retentionPeriod: cdk.Duration.days(14),
    });

    const notificationQueue = new sqs.Queue(this, 'NotificationQueue', {
      queueName: `${prefix}-notifications`,
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      visibilityTimeout: cdk.Duration.seconds(60),
      deadLetterQueue: { queue: deadLetterQueue, maxReceiveCount: 5 },
    });

    const userPool = new cognito.UserPool(this, 'AdminUserPool', {
      userPoolName: `${prefix}-administrators`,
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: true },
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: { otp: true, sms: false },
      passwordPolicy: {
        minLength: 14,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: true,
        requireUppercase: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      deletionProtection: protectData,
      removalPolicy: protectData
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    new cognito.CfnUserPoolGroup(this, 'AdministratorsGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Administrators',
      description: 'Authorized S3 administrators',
    });

    const callbackUrl = customDomain
      ? `https://www.${domainName}/admin`
      : 'http://localhost:3000/admin';
    const logoutUrl = customDomain
      ? `https://www.${domainName}`
      : 'http://localhost:3000';

    const userPoolClient = userPool.addClient('WebClient', {
      authFlows: { userSrp: true },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [callbackUrl],
        logoutUrls: [logoutUrl],
      },
      preventUserExistenceErrors: true,
      accessTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    const cognitoDomain = userPool.addDomain('HostedDomain', {
      cognitoDomain: {
        domainPrefix: `${prefix}-${this.account}`.slice(0, 60),
      },
    });

    if (domainName) {
      new ses.EmailIdentity(this, 'SesDomainIdentity', {
        identity: ses.Identity.domain(domainName),
      });
    }

    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc,
      containerInsightsV2: ecs.ContainerInsights.ENABLED,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'ApiTask', {
      cpu: 512,
      memoryLimitMiB: 1024,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    const container = taskDefinition.addContainer('Api', {
      image: ecs.ContainerImage.fromAsset(
        path.resolve(currentDir, '../../../..'),
        {
          file: 'apps/api/Dockerfile',
          platform: ecrAssets.Platform.LINUX_AMD64,
        },
      ),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'api',
        logRetention: logs.RetentionDays.ONE_MONTH,
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '4000',
        AUTH_MODE: 'cognito',
        WEB_ORIGIN: customDomain ? `https://www.${domainName}` : '*',
        AWS_REGION: this.region,
        S3_BUCKET: resumes.bucketName,
        STORAGE_DRIVER: 's3',
        EMAIL_DRIVER: 'ses',
        EMAIL_FROM: domainName ? `careers@${domainName}` : notificationEmail,
        STAFF_NOTIFICATION_EMAIL: notificationEmail,
        COGNITO_USER_POOL_ID: userPool.userPoolId,
        COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
        DB_HOST: database.clusterEndpoint.hostname,
        DB_PORT: database.clusterEndpoint.port.toString(),
        DB_NAME: 's3staffing',
        SQS_NOTIFICATION_QUEUE_URL: notificationQueue.queueUrl,
      },
      secrets: {
        DB_USER: ecs.Secret.fromSecretsManager(database.secret!, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(database.secret!, 'password'),
      },
      healthCheck: {
        command: [
          'CMD-SHELL',
          'wget -qO- http://localhost:4000/api/v1/health || exit 1',
        ],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    container.addPortMappings({ containerPort: 4000 });
    resumes.grantReadWrite(taskDefinition.taskRole);
    notificationQueue.grantSendMessages(taskDefinition.taskRole);
    taskDefinition.taskRole.addToPrincipalPolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));
    database.secret!.grantRead(taskDefinition.executionRole!);

    let zone: route53.IHostedZone | undefined;
    let certificate: acm.ICertificate | undefined;

    if (customDomain) {
      zone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId,
        zoneName: domainName,
      });
      certificate = new acm.Certificate(this, 'ApiCertificate', {
        domainName: `api.${domainName}`,
        validation: acm.CertificateValidation.fromDns(zone),
      });
    }

    const apiService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      'ApiService',
      {
        serviceName: `${prefix}-api`,
        cluster,
        taskDefinition,
        desiredCount,
        publicLoadBalancer: true,
        circuitBreaker: { rollback: true },
        minHealthyPercent: 100,
        maxHealthyPercent: 200,
        taskSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        certificate,
        domainName: customDomain ? `api.${domainName}` : undefined,
        domainZone: zone,
        redirectHTTP: Boolean(certificate),
        protocol: certificate
          ? elbv2.ApplicationProtocol.HTTPS
          : elbv2.ApplicationProtocol.HTTP,
      },
    );

    apiService.targetGroup.configureHealthCheck({
      path: '/api/v1/health',
      healthyHttpCodes: '200',
      interval: cdk.Duration.seconds(30),
    });
    database.connections.allowDefaultPortFrom(
      apiService.service.connections,
      'API to Aurora',
    );

    const scaling = apiService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 6,
    });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 60,
    });
    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 70,
    });

    const webAcl = new wafv2.CfnWebACL(this, 'WebAcl', {
      defaultAction: { allow: {} },
      scope: 'REGIONAL',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${prefix}-waf`,
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: 'AwsCommonRules',
          priority: 1,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'common-rules',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'IpRateLimit',
          priority: 2,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              aggregateKeyType: 'IP',
              limit: 2000,
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'rate-limit',
            sampledRequestsEnabled: true,
          },
        },
      ],
    });

    new wafv2.CfnWebACLAssociation(this, 'AlbWafAssociation', {
      resourceArn: apiService.loadBalancer.loadBalancerArn,
      webAclArn: webAcl.attrArn,
    });

    const alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      topicName: `${prefix}-alarms`,
    });
    if (notificationEmail) {
      alarmTopic.addSubscription(
        new subscriptions.EmailSubscription(notificationEmail),
      );
    }
    apiService.targetGroup.metrics
      .httpCodeTarget(elbv2.HttpCodeTarget.TARGET_5XX_COUNT)
      .createAlarm(this, 'Api5xxAlarm', {
        evaluationPeriods: 2,
        threshold: 5,
      })
      .addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    const apiOrigin = customDomain
      ? `https://api.${domainName}/api/v1`
      : `http://${apiService.loadBalancer.loadBalancerDnsName}/api/v1`;

    const amplifyApp = new amplify.CfnApp(this, 'WebHosting', {
      name: `${prefix}-web`,
      platform: 'WEB_COMPUTE',
      repository: repositoryUrl || undefined,
      accessToken: repositoryUrl
        ? cdk.SecretValue.secretsManager(
            's3-staffing/prod/amplify-github-token',
          ).unsafeUnwrap()
        : undefined,
      buildSpec: cdk.Fn.toJsonString({
        version: 1,
        applications: [{
          appRoot: 'apps/web',
          frontend: {
            phases: {
              preBuild: { commands: ['cd ../.. && npm ci'] },
              build: { commands: ['npm run build -w @s3/web'] },
            },
            artifacts: {
              baseDirectory: '.next',
              files: ['**/*'],
            },
            cache: {
              paths: ['../../node_modules/**/*', '.next/cache/**/*'],
            },
          },
        }],
      }),
      environmentVariables: [
        { name: 'NEXT_PUBLIC_API_URL', value: apiOrigin },
        { name: 'NEXT_PUBLIC_AUTH_MODE', value: 'cognito' },
        { name: 'AMPLIFY_MONOREPO_APP_ROOT', value: 'apps/web' },
        {
          name: 'NEXT_PUBLIC_COGNITO_AUTHORITY',
          value: `https://cognito-idp.${this.region}.amazonaws.com/${userPool.userPoolId}`,
        },
        {
          name: 'NEXT_PUBLIC_COGNITO_CLIENT_ID',
          value: userPoolClient.userPoolClientId,
        },
        { name: 'NEXT_PUBLIC_COGNITO_REDIRECT_URI', value: callbackUrl },
        { name: 'NEXT_PUBLIC_COGNITO_LOGOUT_URI', value: logoutUrl },
      ],
    });

    const webBranch = new amplify.CfnBranch(this, 'WebBranch', {
      appId: amplifyApp.attrAppId,
      branchName,
      enableAutoBuild: Boolean(repositoryUrl),
      stage: 'PRODUCTION',
      framework: 'Next.js - SSR',
    });
    webBranch.addResourceDependency(amplifyApp);

    if (domainName && repositoryUrl) {
      const webDomain = new amplify.CfnDomain(this, 'WebDomain', {
        appId: amplifyApp.attrAppId,
        domainName,
        subDomainSettings: [
          { branchName, prefix: '' },
          { branchName, prefix: 'www' },
        ],
      });
      webDomain.addResourceDependency(webBranch);
    }

    new cdk.CfnOutput(this, 'ApiUrl', { value: apiOrigin });
    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: amplifyApp.attrAppId,
    });
    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, 'CognitoClientId', {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, 'ResumeBucketName', {
      value: resumes.bucketName,
    });
    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: database.secret!.secretArn,
    });
  }
}
