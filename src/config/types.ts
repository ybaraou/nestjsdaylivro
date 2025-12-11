export type EnvType = 'development' | 'production' | 'test';

export interface EnvironmentVariables {
  node_env: EnvType;
  port: number;
  database?: {
    host?: string;
    port?: number;
  };
  throttle?: {
    limit: number;
    ttl: number;
  };
}
