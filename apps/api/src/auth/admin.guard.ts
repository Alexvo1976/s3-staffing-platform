import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authorization = request.headers?.authorization;

    if (
      !authorization ||
      typeof authorization !== 'string' ||
      !authorization.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authorization.substring(7).trim();

    if (!token) {
      throw new UnauthorizedException(
        'Missing access token',
      );
    }

    const user = await this.auth.verify(token);

    request.user = user;

    return true;
  }
}
