import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { firebaseAdminFactory } from './firebase-admin.factory';
import { FirebaseService } from './firebase.service';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseService, firebaseAdminFactory],
  exports: [FirebaseService],
})
export class FirebaseModule {}
