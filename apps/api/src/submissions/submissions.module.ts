import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';

import { SubmissionsController } from './submissions.controller.js';
import { StorageService } from './storage.service.js';
import { EmailService } from './email.service.js';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    SubmissionsController,
  ],

  providers: [
    StorageService,
    EmailService,
  ],

  exports: [
    StorageService,
    EmailService,
  ],
})
export class SubmissionsModule {}
