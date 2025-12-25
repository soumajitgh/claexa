import { User } from '@entities/user/user.entity';

export interface IAuthService {
  verifyIdToken(token: string): Promise<User>;
}

export const AUTH_SERVICE_TOKEN = 'AUTH_SERVICE';
