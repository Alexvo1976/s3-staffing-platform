import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { AdminGuard } from '../auth/admin.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpsertJobDto } from '../jobs/jobs.dto.js';
import { JobsService } from '../jobs/jobs.service.js';
import { StorageService } from '../submissions/storage.service.js';

import { ApplicationStatusDto } from './admin.dto.js';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,

    @Inject(JobsService)
    private readonly jobs: JobsService,

    @Inject(StorageService)
    private readonly storage: StorageService,
  ) {}

  @Get('dashboard')
  async dashboard() {
    const [
      publishedJobs,
      applications,
      newApplications,
      employers,
      talentProfiles,
    ] = await Promise.all([
      this.prisma.job.count({
        where: {
          status: 'PUBLISHED',
        },
      }),

      this.prisma.application.count(),

      this.prisma.application.count({
        where: {
          status: 'NEW',
        },
      }),

      this.prisma.employerRequest.count(),

      this.prisma.talentProfile.count(),
    ]);

    return {
      publishedJobs,
      applications,
      newApplications,
      employers,
      talentProfiles,
    };
  }

  @Get('jobs')
  jobsList() {
    return this.jobs.listAdmin();
  }

  @Post('jobs')
  createJob(
    @Body() dto: UpsertJobDto,
  ) {
    return this.jobs.create(dto);
  }

  @Put('jobs/:id')
  updateJob(
    @Param('id') id: string,
    @Body() dto: UpsertJobDto,
  ) {
    return this.jobs.update(id, dto);
  }

  @Get('applications')
  applications() {
    return this.prisma.application.findMany({
      include: {
        job: {
          select: {
            title: true,
            slug: true,
          },
        },

        candidate: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Patch('applications/:id/status')
  updateApplication(
    @Param('id') id: string,
    @Body() dto: ApplicationStatusDto,
  ) {
    return this.prisma.application.update({
      where: {
        id,
      },

      data: {
        status: dto.status,
      },
    });
  }

  @Get('applications/:id/resume')
  async resume(
    @Param('id') id: string,
  ) {
    const application =
      await this.prisma.application.findUniqueOrThrow({
        where: {
          id,
        },
      });

    return {
      url: await this.storage.signedDownload(
        application.resumeObjectKey,
      ),
      expiresIn: 300,
    };
  }

  @Get('employer-requests')
  employers() {
    return this.prisma.employerRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  @Get('talent-network')
  talentNetwork() {
    return this.prisma.talentProfile.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
