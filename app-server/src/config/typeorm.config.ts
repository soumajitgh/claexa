import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { createCliDataSource } from './database.config';

const dotenvPath = process.env.DOTENV_CONFIG_PATH || undefined;
config({ path: dotenvPath });

const configService = new ConfigService();

// Create DataSource using the unified configuration
export const AppDataSource = createCliDataSource(configService);

// Export as default for TypeORM CLI
export default AppDataSource;
