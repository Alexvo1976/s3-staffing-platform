import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private async sendWithMicrosoftGraph(
    to: string,
    subject: string,
    text: string,
  ) {
    const tenantId = process.env.MICROSOFT_TENANT_ID;
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const from = process.env.EMAIL_FROM;

    if (!tenantId || !clientId || !clientSecret || !from) {
      throw new Error('Microsoft 365 email configuration is incomplete');
    }

    const tokenUrl =
      'https:' +
      `//login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const tokenResponse = await fetch(
      tokenUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'https:' + '//graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      },
    );

    const token = (await tokenResponse.json()) as {
      access_token?: string;
    };

    if (!tokenResponse.ok || !token.access_token) {
      throw new Error(
        `Microsoft 365 token request failed (${tokenResponse.status})`,
      );
    }

    const sendUrl =
      'https:' +
      `//graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`;

    const sendResponse = await fetch(
      sendUrl,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject,
            body: {
              contentType: 'Text',
              content: text,
            },
            toRecipients: [
              {
                emailAddress: {
                  address: to,
                },
              },
            ],
          },
          saveToSentItems: true,
        }),
      },
    );

    if (!sendResponse.ok) {
      throw new Error(
        `Microsoft 365 email delivery failed (${sendResponse.status})`,
      );
    }
  }

  async send(to: string, subject: string, text: string) {
    if (process.env.EMAIL_DRIVER === 'microsoft-graph') {
      await this.sendWithMicrosoftGraph(to, subject, text);
      return;
    }

    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: process.env.SMTP_SECURE === 'true',
    });

    await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    });
  }

  async applicationReceived(
    email: string,
    name: string,
    jobTitle: string,
  ) {
    await Promise.allSettled([
      this.send(
        email,
        `Application received — ${jobTitle}`,
        `Hi ${name},

Thank you for applying for ${jobTitle}. The Superior Staffing Solutions team will review your information and contact you if your experience matches the role.

Superior Staffing Solutions`,
      ),
      this.send(
        process.env.APPLICATION_NOTIFICATION_EMAIL ??
          process.env.STAFF_NOTIFICATION_EMAIL!,
        `New application — ${jobTitle}`,
        `${name} submitted a new application for ${jobTitle}. Sign in to the administrator portal to review it.`,
      ),
    ]);
  }

  async employerRequestReceived(
    email: string,
    contactName: string,
    company: string,
  ) {
    await Promise.allSettled([
      this.send(
        email,
        'Your Superior Staffing Solutions request was received',
        `Hi ${contactName},

Thank you for contacting Superior Staffing Solutions. We received the staffing request for ${company} and will follow up shortly.`,
      ),
      this.send(
        process.env.EMPLOYER_NOTIFICATION_EMAIL ??
          process.env.STAFF_NOTIFICATION_EMAIL!,
        `New employer request — ${company}`,
        `${contactName} submitted a staffing request for ${company}.`,
      ),
    ]);
  }
}
