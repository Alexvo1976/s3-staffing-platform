import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { CognitoJwtVerifier } from 'aws-jwt-verify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  private readonly verifier =
    process.env.COGNITO_USER_POOL_ID &&
    process.env.COGNITO_CLIENT_ID
      ? CognitoJwtVerifier.create({
          userPoolId: process.env.COGNITO_USER_POOL_ID,
          tokenUse: 'access',
          clientId: process.env.COGNITO_CLIENT_ID,
        })
      : null;

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async localLogin(email: string, password: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (
      !user?.active ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: 'admin',
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '8h',
        issuer: 's3-staffing-local',
      },
    );

    return {
      accessToken: token,
      expiresIn: 28_800,
      user: {
        email: user.email,
        name: user.name,
      },
    };
  }

  async verify(token: string) {
    try {
      if (process.env.AUTH_MODE === 'cognito') {
        if (!this.verifier) {
          throw new Error(
            'Cognito verifier is not configured',
          );
        }

        const payload =
          await this.verifier.verify(token);

        const groups =
          (payload[
            'cognito:groups'
          ] as string[] | undefined) ?? [];

        if (!groups.includes('Administrators')) {
          throw new Error(
            'Administrator group required',
          );
        }

        return payload;
      }

      return jwt.verify(
        token,
        process.env.JWT_SECRET!,
        {
          issuer: 's3-staffing-local',
        },
      );
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired access token',
      );
    }
  }
}
