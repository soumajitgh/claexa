import { Injectable, OnModuleInit } from '@nestjs/common';
import { Auth, DecodedIdToken, getAuth, UserRecord } from 'firebase-admin/auth';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class FirebaseAuthHelper implements OnModuleInit {
  private firebaseAuth: Auth;

  constructor(private firebaseService: FirebaseService) {}

  onModuleInit() {
    this.firebaseAuth = getAuth(this.firebaseService.app);
  }

  async verifyToken(token: string): Promise<DecodedIdToken> {
    return this.firebaseAuth.verifyIdToken(token);
  }

  async getUserRecord(uid: string): Promise<UserRecord> {
    return this.firebaseAuth.getUser(uid);
  }
}
