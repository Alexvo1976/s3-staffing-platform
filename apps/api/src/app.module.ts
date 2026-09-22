import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { SubmissionsModule } from './submissions/submissions.module.js';
import { AdminModule } from './admin/admin.module.js';
import { HealthController } from './common/health.controller.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JobsModule,
    SubmissionsModule,
    AdminModule,

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
  ],

  controllers: [
    HealthController,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
