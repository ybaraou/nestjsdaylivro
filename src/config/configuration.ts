import { EnvironmentVariables, EnvType } from './types';

export default (): EnvironmentVariables => ({
  node_env: process.env.NODE_ENV as EnvType,
  port: parseInt(process.env.PORT ?? '5000'),
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '27017'),
  },
  throttle: {
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '100'),
    ttl: parseInt(process.env.THROTTLE_TTL ?? '1000'),
  },
});
