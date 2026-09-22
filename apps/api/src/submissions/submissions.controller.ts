import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
  Req,
} from '@nestjs/common';

import {
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';

import { Throttle } from '@nestjs/throttler';

import type { FastifyRequest } from 'fastify';

import { PrismaService } from '../prisma/prisma.service.js';

import {
  EmployerRequestDto,
} from './submission.dto.js';

import type {
  CandidateFields,
  TalentFields,
} from './submission.dto.js';

import { StorageService } from './storage.service.js';
import { EmailService } from './email.service.js';


function required(
  value: string | undefined,
  fieldName: string,
): string {
  const cleaned = value?.trim();

  if (!cleaned) {
    throw new BadRequestException(
      `${fieldName} is required`,
    );
  }

  return cleaned;
}


function fields<T>(
  file: {
    fields?: Record<string, unknown>;
  },
): T {
  const result: Record<string, string> = {};

  for (
    const [key, field]
    of Object.entries(file.fields ?? {})
  ) {
    if (
      field &&
      typeof field === 'object' &&
      'value' in field
    ) {
      const value = (
        field as { value?: unknown }
      ).value;

      result[key] =
        value === undefined || value === null
          ? ''
          : String(value);
    }
  }

  return result as T;
}


@ApiTags('submissions')
@Controller()
export class SubmissionsController {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,

    @Inject(StorageService)
    private readonly storage: StorageService,

    @Inject(EmailService)
    private readonly email: EmailService,
  ) {}


  @Post('applications')
  @ApiConsumes('multipart/form-data')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  async apply(
    @Req() request: FastifyRequest,
  ) {
    const file = await request.file();

    if (!file) {
      throw new BadRequestException(
        'Résumé file is required',
      );
    }

    const buffer = await file.toBuffer();

    const form =
      fields<CandidateFields>(file);

    if (form.consent !== 'true') {
      throw new BadRequestException(
        'Consent is required',
      );
    }

    const jobId = required(
      form.jobId,
      'jobId',
    );

    const job =
      await this.prisma.job.findFirst({
        where: {
          id: jobId,
          status: 'PUBLISHED',
        },
      });

    if (!job) {
      throw new BadRequestException(
        'The selected job is not available',
      );
    }

    const resumeObjectKey =
      await this.storage.uploadResume(
        buffer,
        file.filename,
        file.mimetype,
        'applications',
      );

    const candidate =
      await this.prisma.candidate.create({
        data: {
          firstName: required(
            form.firstName,
            'firstName',
          ),

          lastName: required(
            form.lastName,
            'lastName',
          ),

          email: required(
            form.email,
            'email',
          ).toLowerCase(),

          phone: required(
            form.phone,
            'phone',
          ),

          city:
            form.city?.trim() || null,

          state:
            form.state?.trim() || null,

          linkedInUrl:
            form.linkedInUrl?.trim() || null,

          yearsExp:
            form.yearsExp
              ? Number(form.yearsExp)
              : null,

          skills: (form.skills ?? '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        },
      });

    const application =
      await this.prisma.application.create({
        data: {
          jobId: job.id,

          candidateId:
            candidate.id,

          coverLetter:
            form.coverLetter?.trim() ||
            null,

          resumeObjectKey,

          resumeFileName:
            file.filename,

          consentAt:
            new Date(),
        },
      });

    await this.email.applicationReceived(
      candidate.email,
      `${candidate.firstName} ${candidate.lastName}`,
      job.title,
    );

    return {
      success: true,
      id: application.id,
      status: application.status,
    };
  }


  @Post('talent-network')
  @ApiConsumes('multipart/form-data')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  async talentNetwork(
    @Req() request: FastifyRequest,
  ) {
    const file = await request.file();

    if (!file) {
      throw new BadRequestException(
        'Résumé file is required',
      );
    }

    const buffer =
      await file.toBuffer();

    const form =
      fields<TalentFields>(file);

    if (form.consent !== 'true') {
      throw new BadRequestException(
        'Consent is required',
      );
    }

    const firstName = required(
      form.firstName,
      'firstName',
    );

    const lastName = required(
      form.lastName,
      'lastName',
    );

    const email = required(
      form.email,
      'email',
    ).toLowerCase();

    const phone = required(
      form.phone,
      'phone',
    );

    const preferredRoles =
      required(
        form.preferredRoles,
        'preferredRoles',
      );

    const resumeObjectKey =
      await this.storage.uploadResume(
        buffer,
        file.filename,
        file.mimetype,
        'talent-network',
      );

    const profile =
      await this.prisma.talentProfile.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          preferredRoles,

          preferredArea:
            form.preferredArea?.trim() ||
            null,

          workPreference:
            form.workPreference?.trim() ||
            null,

          resumeObjectKey,

          resumeFileName:
            file.filename,

          consentAt:
            new Date(),
        },
      });

    await Promise.allSettled([
      this.email.send(
        email,
        'Your S3 talent profile was received',
        `Hi ${firstName},

Thank you for joining the Superior Staffing Solutions talent network. We received your profile and résumé and will contact you when an opportunity matches your experience and preferences.

Superior Staffing Solutions`,
      ),

      this.email.send(
        process.env
          .STAFF_NOTIFICATION_EMAIL!,
        'New S3 talent network profile',
        `${firstName} ${lastName} submitted a new talent-network profile for: ${preferredRoles}.`,
      ),
    ]);

    return {
      success: true,
      id: profile.id,
    };
  }


  @Post('employer-requests')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  async employerRequest(
    @Body() dto: EmployerRequestDto,
  ) {
    const request =
      await this.prisma.employerRequest.create({
        data: {
          companyName:
            dto.companyName.trim(),

          contactName:
            dto.contactName.trim(),

          email:
            dto.email
              .trim()
              .toLowerCase(),

          phone:
            dto.phone.trim(),

          industry:
            dto.industry.trim(),

          rolesNeeded:
            dto.rolesNeeded.trim(),

          headcount:
            dto.headcount,

          startTimeline:
            dto.startTimeline.trim(),

          engagementType:
            dto.engagementType.trim(),

          additionalDetail:
            dto.additionalDetail?.trim() ||
            null,

          consentAt:
            new Date(),
        },
      });

    await this.email.employerRequestReceived(
      request.email,
      request.contactName,
      request.companyName,
    );

    return {
      success: true,
      id: request.id,
      status: request.status,
    };
  }
}
