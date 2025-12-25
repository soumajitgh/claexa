import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Create database configuration options that can be used by both NestJS and TypeORM CLI
 * @param configService - NestJS ConfigService instance
 * @param options - Optional overrides for specific use cases
 */
export const createDatabaseConfig = (
  configService: ConfigService,
  options: {
    forCli?: boolean;
    forNestJS?: boolean;
  } = {},
): TypeOrmModuleOptions | DataSourceOptions => {
  const host = configService.get<string>('DB_HOST');
  const port = parseInt(configService.get<string>('DB_PORT') || '5432', 10);
  const username = configService.get<string>('DB_USERNAME');
  const password = configService.get<string>('DB_PASSWORD');
  const database = configService.get<string>('DB_NAME');
  const nodeEnv = configService.get<string>('NODE_ENV');

  if (!host || !port || !username || password === undefined || !database) {
    throw new Error(
      'Database environment variables required: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME',
    );
  }

  const ca = configService.get<string>('DATABASE_SSL_CA');

  const sslMode =
    configService.get<string>('PGSSLMODE') ||
    configService.get<string>('DATABASE_SSL_MODE') ||
    configService.get<string>('DB_SSL_MODE');

  // Determine SSL configuration
  // - If a CA is provided, verify the server certificate
  // - Else if sslmode=require (or running in staging/production), require SSL without verification
  // - Otherwise, disable SSL (e.g., local development)
  const isNonDevEnv = ['staging', 'production'].includes(nodeEnv || '');
  const requireSsl = (sslMode || '').toLowerCase() === 'require' || isNonDevEnv;

  let ssl: false | { ca?: string; rejectUnauthorized: boolean } = false;
  if (ca) {
    ssl = { ca, rejectUnauthorized: true };
  } else if (requireSsl) {
    ssl = { rejectUnauthorized: false };
  }

  const baseConfig: DataSourceOptions & Partial<TypeOrmModuleOptions> = {
    type: 'postgres' as const,
    host,
    port,
    username,
    password,
    database,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    logging: nodeEnv === 'development',
    ssl: ssl ? { ...ssl } : false,
  };

  // Configuration for TypeORM CLI
  if (options.forCli) {
    return {
      ...baseConfig,
      synchronize: false, // Always false for CLI operations
    } as DataSourceOptions;
  }

  // Configuration for NestJS application
  return {
    ...baseConfig,
    synchronize: nodeEnv !== 'production',
    migrationsRun: nodeEnv === 'production', // Auto-run migrations in production
    autoLoadEntities: true,
    retryAttempts: 3,
    retryDelay: 3000,
  } as TypeOrmModuleOptions;
};

/**
 * Factory function for NestJS TypeORM module
 */
export const databaseConfigFactory = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return createDatabaseConfig(configService, {
    forNestJS: true,
  }) as TypeOrmModuleOptions;
};

/**
 * Factory function for TypeORM CLI DataSource
 */
export const createCliDataSource = (
  configService: ConfigService,
): DataSource => {
  const config = createDatabaseConfig(configService, {
    forCli: true,
  }) as DataSourceOptions;
  return new DataSource(config);
};
