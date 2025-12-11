import { transports, format } from 'winston';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as dotenv from 'dotenv';

dotenv.config();

export const LoggerFactory = (appName: string) => {
  let consoleFormat;

  const DEBUG = process.env.DEBUG;
  const USE_JSON_LOGGER = process.env.USE_JSON_LOGGER;
  const sanitizeLogs = format((info) => {
    info.token = undefined;
    info.response = undefined;
    info.method = undefined;
    info.ip = undefined;
    info.body = undefined;
    info.statusCode = undefined;
    info.status = undefined;
    info.responseTime = undefined;
    return info;
  });
  if (USE_JSON_LOGGER === 'true') {
    consoleFormat = format.combine(
      format.ms(),
      format.timestamp(),
      format.json(),
    );
  } else {
    consoleFormat = format.combine(
      sanitizeLogs(),
      format.timestamp(),
      format.ms(),
      nestWinstonModuleUtilities.format.nestLike(appName, {
        colors: true,
        prettyPrint: true,
      }),
    );
  }

  return WinstonModule.createLogger({
    level: DEBUG ? 'debug' : 'info',
    transports: [
      new transports.Console({ format: consoleFormat }),
      new transports.File({
        filename: 'logs/app.log',
        level: DEBUG,
        format: format.combine(format.timestamp(), format.simple()),
      }),
    ],
  });
};
