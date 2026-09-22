import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { SubmissionsModule } from '../submissions/submissions.module.js';

import { AdminController } from './admin.controller.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JobsModule,
    SubmissionsModule,
  ],

  controllers: [
    AdminController,
  ],
})
export class AdminModule {}
