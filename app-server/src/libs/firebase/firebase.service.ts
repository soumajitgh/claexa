import { Injectable, Inject } from '@nestjs/common';
import { App } from 'firebase-admin/app';
import { FIREBASE_ADMIN_APP } from './firebase-admin.factory';

@Injectable()
export class FirebaseService {
  constructor(@Inject(FIREBASE_ADMIN_APP) public readonly app: App) {}
}
