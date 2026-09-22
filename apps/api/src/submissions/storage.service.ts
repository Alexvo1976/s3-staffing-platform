import { BadRequestException, Injectable } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const allowed = new Set(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

@Injectable()
export class StorageService {
  private readonly client = new S3Client({
    region: process.env.AWS_REGION,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  });

  async uploadResume(buffer: Buffer, fileName: string, mimeType: string, prefix: string) {
    if (!allowed.has(mimeType)) throw new BadRequestException('Résumé must be a PDF, DOC, or DOCX file');
    if (buffer.byteLength > Number(process.env.MAX_RESUME_BYTES ?? 5_242_880)) throw new BadRequestException('Résumé is larger than 5 MB');
    const safeExt = path.extname(fileName).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.bin';
    const key = `${prefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${safeExt}`;
    await this.client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, Body: buffer, ContentType: mimeType, ServerSideEncryption: process.env.S3_ENDPOINT ? undefined : 'AES256', Metadata: { originalname: encodeURIComponent(fileName) } }));
    return key;
  }

  signedDownload(key: string) {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }), { expiresIn: 300 });
  }
}
