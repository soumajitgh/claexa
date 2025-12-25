import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export const corsOptionsFactory = (
  configService: ConfigService,
): CorsOptions => {
  const env = configService.get<string>('NODE_ENV');
  let allowedOrigins: string[] | string | RegExp = [];

  if (env === 'production') {
    allowedOrigins = ['https://app.claexa.com', 'https://api.claexa.com'];
  } else {
    // More permissive for development and staging, e.g., allow localhost
    allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://app.claexadevelopment.me',
      'https://mobile.claexadevelopment.me',
      'https://api.claexadevelopment.me',
    ];
  }

  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);

      let isAllowed = false;
      if (typeof allowedOrigins === 'string') {
        isAllowed = origin === allowedOrigins;
      } else if (Array.isArray(allowedOrigins)) {
        isAllowed = allowedOrigins.indexOf(origin) !== -1;
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (allowedOrigins instanceof RegExp) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          isAllowed = allowedOrigins.test(origin);
        }
      }

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
};
