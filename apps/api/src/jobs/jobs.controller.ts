import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { JobQueryDto } from './jobs.dto.js';
import { JobsService } from './jobs.service.js';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(
    @Inject(JobsService)
    private readonly jobs: JobsService,
  ) {}

  @Get()
  list(@Query() query: JobQueryDto) {
    return this.jobs.listPublished(query);
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.jobs.getPublished(slug);
  }
}
