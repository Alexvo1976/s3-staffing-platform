import { describe, expect, it } from 'vitest';
import { StorageService } from './storage.service.js';

describe('StorageService', () => {
  it('rejects executable uploads before sending to S3', async () => {
    const service = new StorageService();
    await expect(service.uploadResume(Buffer.from('bad'), 'resume.exe', 'application/octet-stream', 'test')).rejects.toThrow('PDF, DOC, or DOCX');
  });
});
