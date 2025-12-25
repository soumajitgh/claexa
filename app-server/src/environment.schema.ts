import * as Joi from 'joi';

/**
 * Helper function to make a field required in production environment
 * @param schema - The base Joi schema
 * @returns Joi schema that's required in production, optional otherwise
 */
const productionRequired = (schema: Joi.Schema) =>
  schema.when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  });

export const environmentValidationSchema = Joi.object({
  // Application settings
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'staging')
    .required(),
  PORT: Joi.number().default(3000),

  // Database - Individual parameters (preferred approach)
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DATABASE_SSL_CA: Joi.string().optional(),

  // AI service REST API URL
  AI_SERVICE_URL: Joi.string().required(),

  // AI service TLS configuration
  AI_SERVICE_TLS: Joi.boolean().default(false),

  // AWS S3 Configuration (required in production, optional in development with S3 Ninja)
  AWS_REGION: productionRequired(Joi.string()),
  AWS_ACCESS_KEY_ID: productionRequired(Joi.string()),
  AWS_SECRET_ACCESS_KEY: productionRequired(Joi.string()),
  AWS_S3_BUCKET_NAME: productionRequired(Joi.string()),

  // Payment Gateway Configuration
  CASHFREE_APP_ID: Joi.string().required(),
  CASHFREE_SECRET_KEY: Joi.string().required(),

  // Firebase/GCP Configuration
  GCP_PROJECT_ID: Joi.string().optional(),
  GCP_SERVICE_ACCOUNT_KEY_STRING: Joi.string().optional(),

  // Analytics
  POSTHOG_API_KEY: productionRequired(Joi.string()),
  POSTHOG_HOST_URL: productionRequired(Joi.string().uri()),

  // Credit System
  INITIAL_CREDIT_AMOUNT: Joi.number().integer().min(0).default(100),
  CREDIT_THRESHOLD: Joi.number().integer().min(0).default(50),
});
