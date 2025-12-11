import * as Joi from 'joi';

export const configurationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('e2e', 'development', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().port().default(5000),
  THROTTLE_LIMIT: Joi.number().default(10),
  THROTTLE_TTL: Joi.number().default(100),
});
