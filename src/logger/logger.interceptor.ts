import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor() {}
  private readonly logger = new Logger('interceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const { method, url, body, headers, ip } = req;

    // const authorizationHeader =
    //   headers['authorization'] || headers['Authorization'];
    // const bearerToken =
    //   authorizationHeader && authorizationHeader.startsWith('Bearer')
    //     ? authorizationHeader
    //     : null;

    return next.handle().pipe(
      tap((response) => {
        const responseTime = Date.now() - now;
        const res = context.switchToHttp().getResponse();
        const statusCode = res.statusCode;
        const data = JSON.stringify(response);
        this.logger.log('', {
          method,
          url,
          ip,
          body: JSON.stringify(body),
          //   token: bearerToken,
          statusCode,
          status: statusCode,
          responseTime,
          response: data,
        });
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        const statusCode = error?.status;
        const data = JSON.stringify(error);
        this.logger.error('', {
          method,
          url,
          ip,
          body: JSON.stringify(body),
          //   token: bearerToken,
          statusCode,
          status: statusCode,
          responseTime,
          response: data,
        });
        throw error;
      }),
    );
  }
}
