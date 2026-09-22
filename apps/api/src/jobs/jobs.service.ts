import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';
import type {
  JobQueryDto,
  UpsertJobDto,
} from './jobs.dto.js';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
}

@Injectable()
export class JobsService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  listPublished(query: JobQueryDto) {
    const where: Prisma.JobWhereInput = {
      status: 'PUBLISHED',
    };

    if (query.q) {
      where.OR = [
        'title',
        'summary',
        'description',
      ].map((field) => ({
        [field]: {
          contains: query.q,
          mode: 'insensitive',
        },
      }));
    }

    if (query.location) {
      where.AND = [
        {
          OR: [
            {
              city: {
                contains: query.location,
                mode: 'insensitive',
              },
            },
            {
              state: {
                contains: query.location,
                mode: 'insensitive',
              },
            },
          ],
        },
      ];
    }

    if (query.workplace) {
      where.workplace = query.workplace;
    }

    if (query.employmentType) {
      where.employmentType = query.employmentType;
    }

    if (query.industry) {
      where.industry = query.industry;
    }

    return this.prisma.job.findMany({
      where,

      orderBy: [
        {
          featured: 'desc',
        },
        {
          publishedAt: 'desc',
        },
      ],

      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        city: true,
        state: true,
        workplace: true,
        employmentType: true,
        industry: true,
        compensation: true,
        featured: true,
        publishedAt: true,
      },
    });
  }

  async getPublished(slug: string) {
    const job = await this.prisma.job.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  listAdmin() {
    return this.prisma.job.findMany({
      orderBy: {
        updatedAt: 'desc',
      },

      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });
  }

  create(dto: UpsertJobDto) {
    const publishedAt =
      dto.status === 'PUBLISHED'
        ? new Date()
        : null;

    return this.prisma.job.create({
      data: {
        ...dto,

        slug: `${slugify(dto.title)}-${Date.now().toString(36)}`,

        publishedAt,

        closesAt: dto.closesAt
          ? new Date(dto.closesAt)
          : null,
      },
    });
  }

  async update(
    id: string,
    dto: UpsertJobDto,
  ) {
    const existing =
      await this.prisma.job.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException('Job not found');
    }

    return this.prisma.job.update({
      where: {
        id,
      },

      data: {
        ...dto,

        publishedAt:
          dto.status === 'PUBLISHED'
            ? existing.publishedAt ?? new Date()
            : existing.publishedAt,

        closesAt: dto.closesAt
          ? new Date(dto.closesAt)
          : null,
      },
    });
  }
}
