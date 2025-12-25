import { FactoryProvider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { App } from 'firebase-admin/app';

export const FIREBASE_ADMIN_APP = 'FIREBASE_ADMIN_APP';

const logger = new Logger('FirebaseAdminFactory');

export const firebaseAdminFactory: FactoryProvider<App> = {
  provide: FIREBASE_ADMIN_APP,
  useFactory: (configService: ConfigService): App => {
    const projectId = configService.get<string>('GCP_PROJECT_ID');
    const serviceAccountKeyString = configService.get<string>(
      'GCP_SERVICE_ACCOUNT_KEY_STRING',
    );

    if (admin.apps.length > 0) {
      logger.log('Firebase Admin SDK already initialized.');
      return admin.app();
    }

    try {
      let credential: admin.credential.Credential;

      if (serviceAccountKeyString) {
        logger.log(
          'Initializing Firebase Admin SDK using service account key string.',
        );
        const serviceAccount = JSON.parse(serviceAccountKeyString);
        credential = admin.credential.cert(serviceAccount);
      } else {
        logger.log(
          'Initializing Firebase Admin SDK using Application Default Credentials.',
        );
        credential = admin.credential.applicationDefault();
      }

      const app = admin.initializeApp({
        credential,
        projectId,
      });
      logger.log('Firebase Admin SDK initialized successfully.');
      return app;
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK', error);
      throw new Error(
        `Firebase Admin SDK initialization failed: ${error.message}`,
      );
    }
  },
  inject: [ConfigService],
};
