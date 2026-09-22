import { Injectable } from '@nestjs/common';
import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly ses = new SESv2Client({ region: process.env.AWS_REGION });

  async send(to: string, subject: string, text: string) {
    if (process.env.EMAIL_DRIVER === 'ses') {
      await this.ses.send(new SendEmailCommand({ FromEmailAddress: process.env.EMAIL_FROM!, Destination: { ToAddresses: [to] }, Content: { Simple: { Subject: { Data: subject }, Body: { Text: { Data: text } } } } }));
      return;
    }
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 1025), secure: process.env.SMTP_SECURE === 'true' });
    await transport.sendMail({ from: process.env.EMAIL_FROM, to, subject, text });
  }

  async applicationReceived(email: string, name: string, jobTitle: string) {
    await Promise.allSettled([
      this.send(email, `Application received — ${jobTitle}`, `Hi ${name},\n\nThank you for applying for ${jobTitle}. The S3 team will review your information and contact you if your experience matches the role.\n\nSuperior Staffing Solutions`),
      this.send(process.env.STAFF_NOTIFICATION_EMAIL!, `New application — ${jobTitle}`, `${name} submitted a new application for ${jobTitle}. Sign in to the administrator portal to review it.`),
    ]);
  }

  async employerRequestReceived(email: string, contactName: string, company: string) {
    await Promise.allSettled([
      this.send(email, 'Your S3 staffing request was received', `Hi ${contactName},\n\nThank you for contacting Superior Staffing Solutions. We received the staffing request for ${company} and will follow up shortly.`),
      this.send(process.env.STAFF_NOTIFICATION_EMAIL!, `New employer request — ${company}`, `${contactName} submitted a staffing request for ${company}.`),
    ]);
  }
}
