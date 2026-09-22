import { describe, expect, it, vi } from 'vitest';
import { JobsService } from './jobs.service.js';

describe('JobsService', () => {
  it('lists only published jobs and applies search filters', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = new JobsService({ job: { findMany } } as never);
    await service.listPublished({ q: 'nurse', location: 'Chicago' });
    expect(findMany).toHaveBeenCalledOnce();
    const call = findMany.mock.calls[0][0];
    expect(call.where.status).toBe('PUBLISHED');
    expect(call.where.OR).toHaveLength(3);
    expect(call.where.AND).toHaveLength(1);
  });

  it('sets publishedAt when a job is published', async () => {
    const create = vi.fn().mockImplementation(({ data }) => data);
    const service = new JobsService({ job: { create } } as never);
    const result = await service.create({ title: 'Registered Nurse', summary: 'A meaningful nursing opportunity.', description: 'A'.repeat(60), responsibilities: ['Care'], qualifications: ['RN'], city: 'Chicago', state: 'IL', workplace: 'On-site', employmentType: 'Full-time', industry: 'Healthcare', status: 'PUBLISHED' });
    expect(result.publishedAt).toBeInstanceOf(Date);
  });
});
