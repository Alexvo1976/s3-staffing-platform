import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AdminGuard } from './admin.guard.js';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    AdminGuard,
  ],

  exports: [
    AuthService,
    AdminGuard,
  ],
})
export class AuthModule {}
