import {
  Body,
  Controller,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service.js';

type LoginBody = {
  email: string;
  password: string;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly auth: AuthService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginBody) {
    if (!body?.email || !body?.password) {
      throw new UnauthorizedException('Email and password are required');
    }

    return this.auth.localLogin(
      body.email.trim().toLowerCase(),
      body.password,
    );
  }
}
