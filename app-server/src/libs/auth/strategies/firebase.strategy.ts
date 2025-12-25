import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import {
  AUTH_SERVICE_TOKEN,
  IAuthService,
} from '../interfaces/auth-service.interface';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(@Inject(AUTH_SERVICE_TOKEN) private authService: IAuthService) {
    super();
  }

  async validate(token: string) {
    const decodedToken = await this.authService.verifyIdToken(token);
    return decodedToken;
  }
}
